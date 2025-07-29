import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sach, SachDocument, BookStatus } from '../schemas/sach.schema';
import {
  paginateRawAggregate,
  PaginateResult,
} from 'src/Util/paginateWithFacet';
import type { ClientSession, PipelineStage } from 'mongoose';
export type BookListResults = PaginateResult<SachDocument>;

export enum BookFilterType {
  ShowAll = 'show-all',
  ShowInStock = 'show-in-stock',
  ShowOutOfStock = 'show-out-of-stock',

  HiddenAll = 'hidden-all',
  HiddenInStock = 'hidden-in-stock',
  HiddenOutOfStock = 'hidden-out-of-stock',

  AllAll = 'all-all',
  AllInStock = 'all-in-stock',
  AllOutOfStock = 'all-out-of-stock',

  ExcludeActivePromotion = 'excludeActivePromotion',
}

export enum BookSortType {
  Latest = 'latest',
  BestSelling = 'best-selling',
  MostRating = 'most-rating',
  PriceAsc = 'price-asc',
  PriceDesc = 'price-desc',
}

@Injectable()
export class SachRepository {
  constructor(
    @InjectModel(Sach.name)
    private readonly SachModel: Model<SachDocument>
  ) {}

  async create(data: Partial<Sach>, session?: ClientSession): Promise<Sach> {
    const created = await this.SachModel.create(
      [data],
      session ? { session } : {}
    );
    return created[0];
  }

  async updateSold(
    updates: { id: number; sold: number }[],
    session?: ClientSession
  ) {
    const operations = updates.map(({ id, sold }) => ({
      updateOne: {
        filter: { S_id: id },
        update: {
          $inc: {
            S_tonKho: -sold,
            S_daBan: sold,
          },
        },
      },
    }));

    const result = await this.SachModel.bulkWrite(operations, { session });

    return result;
  }

  async updateScore(spId: number, diem: number, session?: ClientSession) {
    return this.SachModel.updateOne(
      { S_id: spId },
      {
        $set: { S_diemDG: diem },
      },
      { session }
    );
  }

  async update(
    id: number,
    data: Partial<Sach>,
    session?: ClientSession
  ): Promise<Sach | null> {
    return this.SachModel.findOneAndUpdate(
      { S_id: id, S_trangThai: { $ne: BookStatus.Deleted } },
      { $set: data },
      {
        new: true,
        session,
      }
    ).lean();
  }

  async remove(id: number): Promise<Sach | null> {
    return this.SachModel.findOneAndDelete({ S_id: id }).lean();
  }

  protected buildSplitPipelines({
    page,
    limit = 24,
    sortType,
    filterType,
    categoryIds,
    keyword,
  }: {
    page: number;
    limit?: number;
    sortType?: BookSortType;
    filterType?: BookFilterType;
    categoryIds?: number[];
    keyword?: string;
  }): { dataPipeline: PipelineStage[]; countPipeline: PipelineStage[] } {
    const ExcludeUnexpiredPromotion =
      filterType === BookFilterType.ExcludeActivePromotion;
    const search = this.getSearch(keyword);
    const filter = this.getFilter(filterType, categoryIds);

    const sort = this.getSort(sortType);
    const skip = (page - 1) * limit;
    const project = this.getProject();

    const needDiscountEarly =
      sortType === BookSortType.PriceAsc || sortType === BookSortType.PriceDesc;

    const preStages: PipelineStage[] = [];
    if (search) preStages.push({ $search: search });

    preStages.push({ $match: filter });

    const dataPipeline: PipelineStage[] = [...preStages];

    if (ExcludeUnexpiredPromotion) {
      dataPipeline.push(...this.buildExcludeUnexpiredPromotionStage());
    } else if (needDiscountEarly) {
      dataPipeline.push(...this.buildPromotionStages());
    }

    if (sort && Object.keys(sort).length > 0) {
      dataPipeline.push({ $sort: sort });
    }

    const countPipeline: PipelineStage[] = [...preStages];

    if (ExcludeUnexpiredPromotion) {
      countPipeline.push(...this.buildExcludeUnexpiredPromotionStage());
    }

    countPipeline.push(...this.buildPromotionStages(), { $count: 'count' });

    dataPipeline.push({ $skip: skip }, { $limit: limit });

    if (!ExcludeUnexpiredPromotion && !needDiscountEarly) {
      dataPipeline.push(...this.buildPromotionStages());
    }

    dataPipeline.push({ $project: project });

    return { dataPipeline, countPipeline };
  }

  protected buildPromotionStages(): PipelineStage[] {
    const now = new Date();

    const stages: PipelineStage[] = [
      {
        $lookup: {
          from: 'chitietkhuyenmais',
          let: { s_id: '$S_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$S_id', '$$s_id'] },
                    { $eq: ['$CTKM_daXoa', false] },
                    { $eq: ['$CTKM_tamNgung', false] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'khuyenmais',
                let: { km_id: '$KM_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$KM_id', '$$km_id'] },
                          { $lte: ['$KM_batDau', now] },
                          { $gte: ['$KM_ketThuc', now] },
                        ],
                      },
                    },
                  },
                ],
                as: 'km',
              },
            },
            {
              $match: {
                $expr: { $gt: [{ $size: '$km' }, 0] }, // Chỉ giữ CTKM có KM hiệu lực
              },
            },
          ],
          as: 'khuyenMai',
        },
      },
    ];

    stages.push({
      $addFields: {
        S_giaGiam: {
          $cond: {
            if: { $gt: [{ $size: '$khuyenMai' }, 0] },
            then: {
              $min: {
                $map: {
                  input: '$khuyenMai',
                  as: 'ctkm',
                  in: '$$ctkm.CTKM_giaSauGiam',
                },
              },
            },
            else: '$S_giaBan',
          },
        },
      },
    });

    return stages;
  }

  protected buildExcludeUnexpiredPromotionStage(): PipelineStage[] {
    const now = new Date();

    return [
      {
        $lookup: {
          from: 'chitietkhuyenmais',
          let: { s_id: '$S_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$S_id', '$$s_id'] },
                    { $eq: ['$CTKM_daXoa', false] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'khuyenmais',
                let: { km_id: '$KM_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$KM_id', '$$km_id'] },
                          { $gte: ['$KM_ketThuc', now] }, // Chưa kết thúc
                        ],
                      },
                    },
                  },
                ],
                as: 'km',
              },
            },
            {
              $match: {
                $expr: {
                  $gt: [{ $size: '$km' }, 0], // Có KM chưa kết thúc
                },
              },
            },
          ],
          as: 'unexpiredPromotions',
        },
      },
      {
        $match: {
          $expr: {
            $eq: [{ $size: '$unexpiredPromotions' }, 0], // Không có khuyến mãi chưa kết thúc
          },
        },
      },
    ];
  }

  protected getSort(sortType?: BookSortType): Record<string, any> | undefined {
    switch (sortType) {
      case BookSortType.Latest:
        return { S_id: -1 }; // mới nhất
      case BookSortType.BestSelling:
        return { S_daBan: -1, S_id: -1 }; // doanh số
      case BookSortType.MostRating:
        return { S_diemDG: -1, S_id: -1 }; // điểm đánh giá giảm
      case BookSortType.PriceAsc:
        return { S_giaGiam: 1, S_id: -1 }; // giá tăng
      case BookSortType.PriceDesc:
        return { S_giaGiam: -1, S_id: -1 }; // giá giảm
      default:
        return undefined;
    }
  }

  protected getFilter(
    filterType: BookFilterType = BookFilterType.AllAll,
    categoryIds?: number[]
  ): Record<string, any> {
    const filter: Record<string, any> = {};

    // Trạng thái
    if (filterType.startsWith('show')) {
      filter.S_trangThai = BookStatus.Show;
    } else if (filterType.startsWith('hidden')) {
      filter.S_trangThai = BookStatus.Hidden;
    } else if (filterType.startsWith('all')) {
      filter.S_trangThai = { $in: [BookStatus.Show, BookStatus.Hidden] };
    }

    // Tồn kho
    if (filterType.endsWith('in-stock')) {
      filter.S_tonKho = { $gt: 0 };
    } else if (filterType.endsWith('out-of-stock')) {
      filter.S_tonKho = 0;
    }

    if (filterType === BookFilterType.ExcludeActivePromotion) {
      filter.S_trangThai = BookStatus.Show;
    }
    // Thể loại
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      filter.TL_id = { $in: categoryIds };
    }

    return filter;
  }

  protected getSearch(keyword?: string) {
    if (!keyword || keyword === '') return undefined;
    return {
      index: 'default',
      text: {
        query: keyword,
        path: ['S_ten', 'S_tacGia', 'S_nhaXuatBan'],
        fuzzy: {
          maxEdits: 1,
          prefixLength: 2,
        },
      },
    };
  }

  protected getProject() {
    return {
      S_id: 1,
      S_isbn: 1,
      S_diemDG: 1,
      S_ten: 1,
      S_tacGia: 1,
      S_nhaXuatBan: 1,
      S_giaBan: 1,
      S_giaGiam: 1,
      S_tonKho: 1,
      S_daBan: 1,
      S_giaNhap: 1,
      S_trangThai: 1,
      S_trongLuong: 1,
      TL_id: 1,
      S_anh: {
        $arrayElemAt: [
          {
            $map: {
              input: {
                $filter: {
                  input: '$S_anh',
                  as: 'anh',
                  cond: { $eq: ['$$anh.A_anhBia', true] },
                },
              },
              as: 'anh',
              in: '$$anh.A_url',
            },
          },
          0,
        ],
      },
    };
  }

  async findAll(
    page: number,
    sortType?: BookSortType,
    filterType?: BookFilterType,
    limit = 24
  ): Promise<BookListResults> {
    const { dataPipeline, countPipeline } = this.buildSplitPipelines({
      page,
      limit,
      sortType,
      filterType,
    });

    return paginateRawAggregate({
      model: this.SachModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  async search(
    page: number,
    sortType?: BookSortType,
    filterType?: BookFilterType,
    limit = 24,
    keyword?: string,
    categoryIds?: number[]
  ): Promise<BookListResults> {
    const { dataPipeline, countPipeline } = this.buildSplitPipelines({
      page,
      limit,
      sortType,
      filterType,
      categoryIds,
      keyword,
    });

    return paginateRawAggregate({
      model: this.SachModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  async findAllShowByIds(ids: number[]): Promise<Sach[]> {
    const project = this.getProject();
    const filter = this.getFilter(BookFilterType.ShowAll);
    const discountLookupStage = this.buildPromotionStages();
    return this.SachModel.aggregate([
      {
        $match: {
          S_id: { $in: ids },
          ...filter,
        },
      },
      ...discountLookupStage,
      { $project: project },
    ]).exec() as Promise<Sach[]>;
  }

  async findLastId(session?: ClientSession): Promise<number> {
    const result = await this.SachModel.findOne()
      .sort({ S_id: -1 })
      .session(session ?? null)
      .lean();

    return result?.S_id ?? 0;
  }
  async findByIsbn(id: string, filterType?: BookFilterType): Promise<any> {
    const discountStages = this.buildPromotionStages();
    const searchFilter = {
      S_isbn: id,
      ...this.getFilter(filterType),
    };
    const project = this.getProject();
    return this.SachModel.aggregate([
      { $match: searchFilter },
      ...discountStages,
      { $project: project },
    ]).then((result: Sach[]) => result[0] ?? null);
  }

  async findById(
    id: number,
    mode: 'default' | 'full' = 'default'
  ): Promise<any> {
    const discountStages = this.buildPromotionStages();

    if (mode === 'full') {
      const filter = this.getFilter(BookFilterType.ShowAll);
      return this.SachModel.aggregate([
        {
          $match: {
            S_id: id,
            ...filter,
          },
        },
        {
          $lookup: {
            from: 'theloais',
            localField: 'TL_id',
            foreignField: 'TL_id',
            as: 'S_TL_info',
          },
        },
        {
          $addFields: {
            S_TL: {
              $map: {
                input: '$S_TL_info',
                as: 'tl',
                in: {
                  TL_id: '$$tl.TL_id',
                  TL_ten: '$$tl.TL_ten',
                },
              },
            },
          },
        },
        ...discountStages,
        {
          $project: {
            lichSuThaoTac: 0,
            S_TL_info: 0,
            khuyenMai: 0,
          },
        },
      ]).then((result: Sach[]) => result[0] ?? null);
    }

    // mode === 'default'
    return this.SachModel.findOne({
      S_id: id,
      S_trangThai: { $ne: BookStatus.Deleted },
    })
      .select('-S_eTomTat')
      .lean()
      .exec();
  }

  async searchAutocomplete(keyword: string, limit = 10): Promise<string[]> {
    const pipelineForField = (field: string, priority: number) => [
      {
        $search: {
          index: 'default',
          autocomplete: {
            query: keyword,
            path: field,
          },
        },
      },
      {
        $project: {
          suggestion: `$${field}`,
          _id: 0,
          priority: { $literal: priority },
        },
      },
      {
        $match: {
          suggestion: {
            $ne: null,
            $regex: keyword,
            $options: 'i',
          },
        },
      },
    ];

    const result: { suggestion: string }[] = await this.SachModel.aggregate([
      ...pipelineForField('S_ten', 1),
      {
        $unionWith: {
          coll: 'saches',
          pipeline: pipelineForField('S_tacGia', 2),
        },
      },
      {
        $unionWith: {
          coll: 'saches',
          pipeline: pipelineForField('S_nhaXuatBan', 3),
        },
      },
      {
        $group: {
          _id: '$suggestion',
          priority: { $min: '$priority' },
        },
      },
      {
        $sort: { priority: 1 },
      },
      {
        $replaceWith: { suggestion: '$_id' },
      },
      {
        $limit: limit,
      },
    ]);

    return result.map((item) => item.suggestion);
  }

  async findByVector(
    queryVector: number[],
    limit = 5,
    minScore = 0
  ): Promise<any[]> {
    const project = this.getProject();
    const discountStages = this.buildPromotionStages();

    return this.SachModel.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'S_eTomTat',
          queryVector,
          numCandidates: 50,
          limit,
        },
      },
      {
        $match: {
          S_trangThai: BookStatus.Show,
        },
      },
      {
        $addFields: {
          vectorScore: { $meta: 'vectorSearchScore' },
        },
      },
      {
        $match: {
          vectorScore: { $gte: minScore },
        },
      },
      {
        $sort: { vectorScore: -1 },
      },
      {
        $lookup: {
          from: 'theloais',
          localField: 'TL_id',
          foreignField: 'TL_id',
          as: 'S_TL_info',
        },
      },
      {
        $addFields: {
          S_TL: {
            $map: {
              input: '$S_TL_info',
              as: 'tl',
              in: '$$tl.TL_ten',
            },
          },
        },
      },

      ...discountStages,
      {
        $project: {
          ...project,
          S_TL: 1,
          score: '$vectorScore',
        },
      },
    ]).exec();
  }

  async countAll(): Promise<{
    live: { total: number; in: number; out: number };
    hidden: { total: number; in: number; out: number };
  }> {
    const [liveTotal, liveIn, liveOut, hiddenTotal, hiddenIn, hiddenOut] =
      await Promise.all([
        this.SachModel.countDocuments({ S_trangThai: BookStatus.Show }),
        this.SachModel.countDocuments({
          S_trangThai: BookStatus.Show,
          S_tonKho: { $gt: 0 },
        }),
        this.SachModel.countDocuments({
          S_trangThai: BookStatus.Show,
          S_tonKho: 0,
        }),

        this.SachModel.countDocuments({
          S_trangThai: BookStatus.Hidden,
        }),
        this.SachModel.countDocuments({
          S_trangThai: BookStatus.Hidden,
          S_tonKho: { $gt: 0 },
        }),
        this.SachModel.countDocuments({
          S_trangThai: BookStatus.Hidden,
          S_tonKho: 0,
        }),
      ]);

    return {
      live: { total: liveTotal, in: liveIn, out: liveOut },
      hidden: { total: hiddenTotal, in: hiddenIn, out: hiddenOut },
    };
  }

  async count(filterType?: BookStatus | 'all'): Promise<number> {
    const filter: any = {};

    if (filterType === BookStatus.Show) {
      filter.S_trangThai = BookStatus.Show;
    } else if (filterType === BookStatus.Hidden) {
      filter.S_trangThai = BookStatus.Hidden;
    } else {
      filter.S_trangThai = { $in: [BookStatus.Show, BookStatus.Hidden] };
    }

    return this.SachModel.countDocuments(filter);
  }

  async findInCategories(ids: number[]) {
    return this.SachModel.find({
      TL_id: { $in: ids },
    });
  }
}
