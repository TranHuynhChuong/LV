import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SanPham, SanPhamDocument } from './sanPham.schema';
import {
  paginateRawAggregate,
  PaginateResult,
} from 'src/Util/paginateWithFacet';
import type { PipelineStage } from 'mongoose';
export type ProductListResults = PaginateResult<SanPhamDocument>;

@Injectable()
export class SanPhamRepository {
  constructor(
    @InjectModel(SanPham.name)
    private readonly model: Model<SanPhamDocument>
  ) {}

  async create(data: Partial<SanPham>): Promise<SanPham> {
    return this.model.create(data);
  }

  async update(id: number, data: Partial<SanPham>): Promise<SanPham | null> {
    return this.model
      .findOneAndUpdate(
        { SP_id: id, SP_trangThai: { $ne: 0 } },
        { $set: data },
        { new: true }
      )
      .lean();
  }

  async delete(id: number): Promise<SanPham | null> {
    return this.model
      .findOneAndUpdate(
        { SP_id: id },
        { $set: { SP_trangThai: 0 } },
        { new: true }
      )
      .lean();
  }

  async remove(id: number): Promise<SanPham | null> {
    return this.model.findOneAndDelete({ SP_id: id }).lean();
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
    sortType?: number;
    filterType?: number;
    categoryIds?: number[];
    keyword?: string;
  }): { dataPipeline: PipelineStage[]; countPipeline: PipelineStage[] } {
    const search = this.getSearch(keyword);
    const filter =
      filterType === 0
        ? this.getFilter(11, categoryIds)
        : this.getFilter(filterType, categoryIds);

    const sort = this.getSort(sortType);
    const skip = (page - 1) * limit;
    const project = this.getProject();

    const needDiscountEarly = sortType === 3 || sortType === 4;

    const preStages: PipelineStage[] = [];
    if (search) preStages.push({ $search: search });
    preStages.push({ $match: filter });

    const dataPipeline: PipelineStage[] = [...preStages];

    if (needDiscountEarly) {
      dataPipeline.push(...this.getDiscountLookupStage(filterType === 0));
    }

    const countPipeline = [...dataPipeline, { $count: 'count' }];

    if (sort && Object.keys(sort).length > 0) {
      dataPipeline.push({ $sort: sort });
    }

    dataPipeline.push({ $skip: skip }, { $limit: limit });

    if (!needDiscountEarly) {
      dataPipeline.push(...this.getDiscountLookupStage(false));
    }

    if (project && Object.keys(project).length > 0) {
      dataPipeline.push({ $project: project });
    }

    return { dataPipeline, countPipeline };
  }

  protected getDiscountLookupStage(onlyDiscounted: boolean): PipelineStage[] {
    const now = new Date();
    const stages: PipelineStage[] = [
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
                          { $eq: ['$KM_daXoa', false] },
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
            { $unwind: '$km' },
            {
              $addFields: {
                CTKM_mucGiam: '$km.KM_mucGiam',
              },
            },
          ],
          as: 'khuyenMai',
        },
      },
      {
        $addFields: {
          giaGiam: {
            $cond: {
              if: { $gt: [{ $size: '$khuyenMai' }, 0] },
              then: {
                $let: {
                  vars: {
                    goc: '$SP_giaBan',
                    mucGiam: { $arrayElemAt: ['$khuyenMai.CTKM_giaTri', 0] },
                    theoTyLe: { $arrayElemAt: ['$khuyenMai.CTKM_theoTyLe', 0] },
                  },
                  in: {
                    $cond: {
                      if: '$$theoTyLe',
                      then: {
                        $subtract: [
                          '$$goc',
                          {
                            $multiply: [
                              '$$goc',
                              { $divide: ['$$mucGiam', 100] },
                            ],
                          },
                        ],
                      },
                      else: {
                        $subtract: ['$$goc', '$$mucGiam'],
                      },
                    },
                  },
                },
              },
              else: '$SP_giaBan',
            },
          },
        },
      },
    ];

    if (onlyDiscounted) {
      stages.push({
        $match: {
          $expr: { $eq: ['$giaGiam', '$SP_giaBan'] },
        },
      });
    }

    return stages;
  }

  protected getSort(sortType?: number): Record<string, any> | undefined {
    switch (sortType) {
      case 1:
        return { SP_id: -1 }; // mới nhất
      case 2:
        return { SP_daBan: -1, SP_id: -1 }; // doanh số
      case 3:
        return { giaGiam: 1, SP_id: -1 }; // giá tăng
      case 4:
        return { giaGiam: -1, SP_id: -1 }; // giá giảm
      default:
        return undefined;
    }
  }

  protected getFilter(
    filterType: number = 11,
    categoryIds?: number[]
  ): Record<string, any> {
    const filter: Record<string, any> = {};
    // Tách trạng thái từ filterType
    const statusType = Math.floor(filterType / 10); // 1: live, 2: hidden, 3: all
    const stockType = filterType % 10; // 0: all, 1: in stock, 2: out of stock

    // Trạng thái sản phẩm
    if (statusType === 1 || statusType === 2) {
      filter.SP_trangThai = statusType;
    } else if (statusType === 3) {
      filter.SP_trangThai = { $in: [1, 2] };
    }

    // Tồn kho
    if (stockType === 2) {
      filter.SP_tonKho = { $gt: 0 };
    } else if (stockType === 3) {
      filter.SP_tonKho = 0;
    }

    // Lọc theo thể loại (nếu có)
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
      SP_giaGiam: '$giaGiam',
      SP_tonKho: 1,
      SP_daBan: 1,
      SP_giaNhap: 1,
      SP_trangThai: 1,
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
    sortType?: number,
    filterType?: number,
    limit = 24
  ): Promise<ProductListResults> {
    const { dataPipeline, countPipeline } = this.buildSplitPipelines({
      page,
      limit,
      sortType,
      filterType,
    });

    return paginateRawAggregate({
      model: this.model,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  async search(
    page: number,
    sortType?: number,
    filterType?: number,
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
      model: this.model,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  async findByIds(ids: number[]): Promise<Partial<SanPham>[]> {
    const filter = this.getFilter(10);
    const project = this.getProject();

    return this.model.aggregate([
      {
        $match: {
          SP_id: { $in: ids },
          ...filter,
        },
      },
      {
        $project: project,
      },
    ]);
  }

  async findLastId(): Promise<number> {
    const last = await this.model.findOne().sort({ SP_id: -1 }).lean();
    return last?.SP_id ?? 0;
  }

  async findById(
    id: number,
    mode: 'default' | 'full' | 'search' = 'default',
    filterType?: number
  ): Promise<SanPham | null> {
    if (mode === 'search') {
      const filter = {
        SP_id: id,
        ...this.getFilter(filterType),
      };
      const project = this.getProject();
      return this.model
        .aggregate([{ $match: filter }, { $project: project }])
        .then((result: SanPham[]) => result[0] ?? null);
    }

    if (mode === 'full') {
      return this.model
        .aggregate([
          { $match: { SP_id: id, SP_trangThai: { $ne: 0 } } },
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

          {
            $project: {
              SP_eTomTat: 0,
              lichSuThaoTac: 0,
              SP_TL_info: 0, // ẩn mảng trung gian nếu không cần
            },
          },
        ])
        .then((result: SanPham[]) => result[0] ?? null);
    }

    // mode === 'default'
    return this.model
      .findOne({ SP_id: id, SP_trangThai: { $ne: 0 } })
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

    const result: { suggestion: string }[] = await this.model.aggregate([
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
    return this.model
      .aggregate([
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'SP_eTomTat',
            queryVector, // Mảng số (vector)
            numCandidates: 100, // Số lượng bản ghi được xét để tìm top kết quả
            limit, // Số kết quả trả về
          },
        },
        { $limit: limit },
        {
          $project: {
            ...project,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ])
      .exec();
  }

  async countAll(): Promise<{
    all: { total: number; in: number; out: number };
    live: { total: number; in: number; out: number };
    hidden: { total: number; in: number; out: number };
  }> {
    const [
      allTotal,
      allIn,
      allOut,
      liveTotal,
      liveIn,
      liveOut,
      hiddenTotal,
      hiddenIn,
      hiddenOut,
    ] = await Promise.all([
      this.model.countDocuments({ SP_trangThai: { $in: [1, 2] } }),
      this.model.countDocuments({
        SP_trangThai: { $in: [1, 2] },
        SP_tonKho: { $gt: 0 },
      }),
      this.model.countDocuments({
        SP_trangThai: { $in: [1, 2] },
        SP_tonKho: 0,
      }),

      this.model.countDocuments({ SP_trangThai: 1 }),
      this.model.countDocuments({ SP_trangThai: 1, SP_tonKho: { $gt: 0 } }),
      this.model.countDocuments({ SP_trangThai: 1, SP_tonKho: 0 }),

      this.model.countDocuments({ SP_trangThai: 2 }),
      this.model.countDocuments({ SP_trangThai: 2, SP_tonKho: { $gt: 0 } }),
      this.model.countDocuments({ SP_trangThai: 2, SP_tonKho: 0 }),
    ]);

    return {
      all: { total: allTotal, in: allIn, out: allOut },
      live: { total: liveTotal, in: liveIn, out: liveOut },
      hidden: { total: hiddenTotal, in: hiddenIn, out: hiddenOut },
    };
  }

  async count(filterType?: number): Promise<number> {
    const filter: any = {};

    if (filterType === 1) filter.SP_trangThai = 1;
    else if (filterType === 2) filter.SP_trangThai = 2;
    else filter.SP_trangThai = { $in: [1, 2] };

    return this.model.countDocuments(filter);
  }
}
