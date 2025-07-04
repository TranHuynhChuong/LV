import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SanPham,
  SanPhamDocument,
  ProductStatus,
} from '../schemas/san-pham.schema';
import {
  paginateRawAggregate,
  PaginateResult,
} from 'src/Util/paginateWithFacet';
import type { ClientSession, PipelineStage } from 'mongoose';
export type ProductListResults = PaginateResult<SanPhamDocument>;

export enum ProductFilterType {
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

export enum ProductSortType {
  Latest = 'latest',
  BestSelling = 'best-selling',
  MostRating = 'most-rating',
  PriceAsc = 'price-asc',
  PriceDesc = 'price-desc',
}

@Injectable()
export class SanPhamRepository {
  constructor(
    @InjectModel(SanPham.name)
    private readonly SanPhamModel: Model<SanPhamDocument>
  ) {}

  async create(
    data: Partial<SanPham>,
    session?: ClientSession
  ): Promise<SanPham> {
    const created = await this.SanPhamModel.create(
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
        filter: { SP_id: id },
        update: {
          $inc: {
            SP_tonKho: -sold,
            SP_daBan: sold,
          },
        },
      },
    }));

    const result = await this.SanPhamModel.bulkWrite(operations, { session });

    return result;
  }

  async updateScore(spId: number, diem: number, session?: ClientSession) {
    return this.SanPhamModel.updateOne(
      { SP_id: spId },
      {
        $set: { SP_diemDG: diem },
      },
      { session }
    );
  }

  async update(
    id: number,
    data: Partial<SanPham>,
    session?: ClientSession
  ): Promise<SanPham | null> {
    return this.SanPhamModel.findOneAndUpdate(
      { SP_id: id, SP_trangThai: { $ne: ProductStatus.Deleted } },
      { $set: data },
      {
        new: true,
        session,
      }
    ).lean();
  }

  async remove(id: number): Promise<SanPham | null> {
    return this.SanPhamModel.findOneAndDelete({ SP_id: id }).lean();
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
    sortType?: ProductSortType;
    filterType?: ProductFilterType;
    categoryIds?: number[];
    keyword?: string;
  }): { dataPipeline: PipelineStage[]; countPipeline: PipelineStage[] } {
    const excludeActivePromotion =
      filterType === ProductFilterType.ExcludeActivePromotion;
    const search = this.getSearch(keyword);
    const filter = this.getFilter(filterType, categoryIds);

    const sort = this.getSort(sortType);
    const skip = (page - 1) * limit;
    const project = this.getProject();

    const needDiscountEarly =
      sortType === ProductSortType.PriceAsc ||
      sortType === ProductSortType.PriceDesc;

    const preStages: PipelineStage[] = [];
    if (search) preStages.push({ $search: search });

    preStages.push({ $match: filter });

    const dataPipeline: PipelineStage[] = [...preStages];

    if (needDiscountEarly) {
      dataPipeline.push(...this.buildPromotionStages(excludeActivePromotion));
    }

    if (sort && Object.keys(sort).length > 0) {
      dataPipeline.push({ $sort: sort });
    }

    const countPipeline = [
      ...preStages,
      ...this.buildPromotionStages(excludeActivePromotion),
      { $count: 'count' },
    ];

    dataPipeline.push({ $skip: skip }, { $limit: limit });

    if (!needDiscountEarly) {
      dataPipeline.push(...this.buildPromotionStages(excludeActivePromotion));
    }

    dataPipeline.push({ $project: project });

    return { dataPipeline, countPipeline };
  }

  protected buildPromotionStages(excludeActive = false): PipelineStage[] {
    const now = new Date();

    const stages: PipelineStage[] = [
      // B1: Lấy tất cả CTKM còn hiệu lực gắn với sản phẩm
      {
        $lookup: {
          from: 'chitietkhuyenmais',
          let: { sp_id: '$SP_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$SP_id', '$$sp_id'] },
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

    // B2: Nếu excludeActive = true => loại sản phẩm có khuyến mãi hiệu lực
    if (excludeActive) {
      stages.push({
        $match: {
          $expr: { $eq: [{ $size: '$khuyenMai' }, 0] },
        },
      });
    } else {
      // B3: Tính SP_giaGiam nếu có khuyến mãi
      stages.push({
        $addFields: {
          SP_giaGiam: {
            $cond: {
              if: { $gt: [{ $size: '$khuyenMai' }, 0] },
              then: {
                $let: {
                  vars: {
                    goc: '$SP_giaBan',
                  },
                  in: {
                    $subtract: [
                      '$$goc',
                      {
                        $max: {
                          $map: {
                            input: '$khuyenMai',
                            as: 'km',
                            in: {
                              $cond: {
                                if: '$$km.CTKM_theoTyLe',
                                then: {
                                  $multiply: [
                                    '$$goc',
                                    { $divide: ['$$km.CTKM_giaTri', 100] },
                                  ],
                                },
                                else: '$$km.CTKM_giaTri',
                              },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
              else: '$SP_giaBan',
            },
          },
        },
      });
    }

    return stages;
  }

  protected getSort(
    sortType?: ProductSortType
  ): Record<string, any> | undefined {
    switch (sortType) {
      case ProductSortType.Latest:
        return { SP_id: -1 }; // mới nhất
      case ProductSortType.BestSelling:
        return { SP_daBan: -1, SP_id: -1 }; // doanh số
      case ProductSortType.MostRating:
        return { SP_diemDG: -1, SP_id: -1 }; // điểm đánh giá giảm
      case ProductSortType.PriceAsc:
        return { SP_giaGiam: 1, SP_id: -1 }; // giá tăng
      case ProductSortType.PriceDesc:
        return { SP_giaGiam: -1, SP_id: -1 }; // giá giảm
      default:
        return undefined;
    }
  }

  protected getFilter(
    filterType: ProductFilterType = ProductFilterType.AllAll,
    categoryIds?: number[]
  ): Record<string, any> {
    const filter: Record<string, any> = {};

    // Trạng thái
    if (filterType.startsWith('show')) {
      filter.SP_trangThai = ProductStatus.Show;
    } else if (filterType.startsWith('hidden')) {
      filter.SP_trangThai = ProductStatus.Hidden;
    } else if (filterType.startsWith('all')) {
      filter.SP_trangThai = { $in: [ProductStatus.Show, ProductStatus.Hidden] };
    }

    // Tồn kho
    if (filterType.endsWith('in-stock')) {
      filter.SP_tonKho = { $gt: 0 };
    } else if (filterType.endsWith('out-of-stock')) {
      filter.SP_tonKho = 0;
    }

    if (filterType === ProductFilterType.ExcludeActivePromotion) {
      filter.SP_trangThai = ProductStatus.Show;
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
        path: ['SP_ten', 'SP_tacGia', 'SP_nhaXuatBan'],
        fuzzy: {
          maxEdits: 2,
          prefixLength: 1,
        },
      },
    };
  }

  protected getProject() {
    return {
      SP_id: 1,
      SP_diemDG: 1,
      SP_ten: 1,
      SP_giaBan: 1,
      SP_giaGiam: 1,
      SP_tonKho: 1,
      SP_daBan: 1,
      SP_giaNhap: 1,
      SP_trangThai: 1,
      SP_trongLuong: 1,
      TL_id: 1,
      SP_anh: {
        $arrayElemAt: [
          {
            $map: {
              input: {
                $filter: {
                  input: '$SP_anh',
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
    sortType?: ProductSortType,
    filterType?: ProductFilterType,
    limit = 24
  ): Promise<ProductListResults> {
    const { dataPipeline, countPipeline } = this.buildSplitPipelines({
      page,
      limit,
      sortType,
      filterType,
    });

    return paginateRawAggregate({
      model: this.SanPhamModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  async search(
    page: number,
    sortType?: ProductSortType,
    filterType?: ProductFilterType,
    limit = 24,
    keyword?: string,
    categoryIds?: number[]
  ): Promise<ProductListResults> {
    const { dataPipeline, countPipeline } = this.buildSplitPipelines({
      page,
      limit,
      sortType,
      filterType,
      categoryIds,
      keyword,
    });

    return paginateRawAggregate({
      model: this.SanPhamModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  async findAllShowByIds(ids: number[]): Promise<SanPham[]> {
    const project = this.getProject();
    const filter = this.getFilter(ProductFilterType.ShowAll);
    const discountLookupStage = this.buildPromotionStages();
    return this.SanPhamModel.aggregate([
      {
        $match: {
          SP_id: { $in: ids },
          ...filter,
        },
      },
      ...discountLookupStage,
      { $project: project },
    ]).exec() as Promise<SanPham[]>;
  }

  async findLastId(session?: ClientSession): Promise<number> {
    const result = await this.SanPhamModel.findOne()
      .sort({ SP_id: -1 })
      .session(session ?? null)
      .lean();

    return result?.SP_id ?? 0;
  }
  async findByIsbn(id: string, filterType?: ProductFilterType): Promise<any> {
    const discountStages = this.buildPromotionStages();
    const searchFilter = {
      SP_isbn: id,
      ...this.getFilter(filterType),
    };
    const project = this.getProject();
    return this.SanPhamModel.aggregate([
      { $match: searchFilter },
      ...discountStages,
      { $project: project },
    ]).then((result: SanPham[]) => result[0] ?? null);
  }

  async findById(
    id: number,
    mode: 'default' | 'full' = 'default',
    filterType?: ProductFilterType
  ): Promise<any> {
    const filter = this.getFilter(filterType);
    const discountStages = this.buildPromotionStages();

    if (mode === 'full') {
      return this.SanPhamModel.aggregate([
        {
          $match: {
            SP_id: id,
            ...filter,
          },
        },
        {
          $lookup: {
            from: 'theloais',
            localField: 'TL_id', // TL_id trong sản phẩm là mảng
            foreignField: 'TL_id', // TL_id trong bảng thể loại là số
            as: 'SP_TL_info',
          },
        },
        {
          $addFields: {
            SP_TL: {
              $map: {
                input: '$SP_TL_info',
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
            SP_TL_info: 0,
            khuyenMai: 0,
          },
        },
      ]).then((result: SanPham[]) => result[0] ?? null);
    }

    // mode === 'default'
    return this.SanPhamModel.findOne({
      SP_id: id,
      SP_trangThai: { $ne: ProductStatus.Deleted },
    })
      .select('-SP_eTomTat')
      .lean()
      .exec();
  }

  async searchAutocomplete(keyword: string): Promise<string[]> {
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

    const result: { suggestion: string }[] = await this.SanPhamModel.aggregate([
      ...pipelineForField('SP_ten', 1),
      {
        $unionWith: {
          coll: 'sanphams',
          pipeline: pipelineForField('SP_tacGia', 2),
        },
      },
      {
        $unionWith: {
          coll: 'sanphams',
          pipeline: pipelineForField('SP_nhaXuatBan', 3),
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
        $limit: 10,
      },
    ]);

    return result.map((item) => item.suggestion);
  }

  async findByVector(queryVector: number[], limit = 5): Promise<any[]> {
    const project = this.getProject();
    const discountStages = this.buildPromotionStages();

    return this.SanPhamModel.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'SP_eTomTat',
          queryVector,
          numCandidates: 100,
          limit,
        },
      },
      {
        $match: {
          SP_trangThai: ProductStatus.Show,
        },
      },
      {
        $addFields: {
          vectorScore: { $meta: 'vectorSearchScore' },
        },
      },
      {
        $lookup: {
          from: 'theloais',
          localField: 'TL_id',
          foreignField: 'TL_id',
          as: 'SP_TL_info',
        },
      },
      {
        $addFields: {
          SP_TL: {
            $map: {
              input: '$SP_TL_info',
              as: 'tl',
              in: '$$tl.TL_ten', // ✅ chỉ lấy tên thể loại
            },
          },
        },
      },

      ...discountStages,
      {
        $project: {
          ...project,
          SP_TL: 1, // ✅ thêm vào để giữ kết quả lookup
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
        this.SanPhamModel.countDocuments({ SP_trangThai: ProductStatus.Show }),
        this.SanPhamModel.countDocuments({
          SP_trangThai: ProductStatus.Show,
          SP_tonKho: { $gt: 0 },
        }),
        this.SanPhamModel.countDocuments({
          SP_trangThai: ProductStatus.Show,
          SP_tonKho: 0,
        }),

        this.SanPhamModel.countDocuments({
          SP_trangThai: ProductStatus.Hidden,
        }),
        this.SanPhamModel.countDocuments({
          SP_trangThai: ProductStatus.Hidden,
          SP_tonKho: { $gt: 0 },
        }),
        this.SanPhamModel.countDocuments({
          SP_trangThai: ProductStatus.Hidden,
          SP_tonKho: 0,
        }),
      ]);

    return {
      live: { total: liveTotal, in: liveIn, out: liveOut },
      hidden: { total: hiddenTotal, in: hiddenIn, out: hiddenOut },
    };
  }

  async count(filterType?: ProductStatus | 'all'): Promise<number> {
    const filter: any = {};

    if (filterType === ProductStatus.Show) {
      filter.SP_trangThai = ProductStatus.Show;
    } else if (filterType === ProductStatus.Hidden) {
      filter.SP_trangThai = ProductStatus.Hidden;
    } else {
      filter.SP_trangThai = { $in: [ProductStatus.Show, ProductStatus.Hidden] };
    }

    return this.SanPhamModel.countDocuments(filter);
  }

  async findInCategories(ids: number[]) {
    return this.SanPhamModel.find({
      TL_id: { $in: ids },
    });
  }
}
