import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SanPham, SanPhamDocument } from './sanPham.schema';
import { paginateWithFacet, PaginateResult } from 'src/Util/paginateWithFacet';

export type ProductListResults = PaginateResult<SanPhamDocument>;

@Injectable()
export class SanPhamRepository {
  constructor(
    @InjectModel(SanPham.name)
    private readonly model: Model<SanPhamDocument>
  ) {}

  protected getSort(sortType: number): Record<string, number> {
    switch (sortType) {
      case 1:
        return { SP_id: 1 };
      case -1:
        return { SP_id: -1 };
      case 2:
        return { SP_giaBan: 1, SP_id: 1 };
      case -2:
        return { SP_giaBan: -1, SP_id: -1 };
      case 3:
        return { SP_daBan: 1, SP_id: 1 };
      case -3:
        return { SP_daBan: -1, SP_id: -1 };
      default:
        return { SP_id: -1 };
    }
  }

  protected getFilter(
    filterType?: number,
    categoryId?: number
  ): Record<string, any> {
    const filter: Record<string, any> = {};

    // Trạng thái sản phẩm
    if (filterType === 1) filter.SP_trangThai = 1;
    else if (filterType === 2) filter.SP_trangThai = 2;
    else filter.SP_trangThai = { $in: [1, 2] };

    // Lọc theo thể loại
    if (categoryId !== undefined) {
      filter.TL_id = { $in: [categoryId] };
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
      SP_tonKho: 1,
      SP_daBan: 1,
      SP_giaNhap: 1,
      SP_trangThai: 1,
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
    sortType: number,
    filterType?: number,
    limit = 24
  ): Promise<ProductListResults> {
    const project = this.getProject();
    const filter = this.getFilter(filterType);
    const sort = this.getSort(sortType);
    const search = undefined;

    return paginateWithFacet({
      model: this.model,
      page,
      limit,
      search,
      filter,
      sort,
      project,
    });
  }

  async search(
    page: number,
    sortType: number,
    filterType?: number,
    limit = 24,
    keyword?: string,
    categoryId?: number
  ): Promise<ProductListResults> {
    const project = this.getProject();
    const filter = this.getFilter(filterType, categoryId);
    const sort = this.getSort(sortType);
    const search = this.getSearch(keyword);

    return paginateWithFacet({
      model: this.model,
      page,
      limit,
      search,
      filter,
      sort,
      project,
    });
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
        .then((result: SanPham[]) => result[0] ?? []);
    } else {
      const select =
        mode === 'default'
          ? '-SP_eTomTat -SP_diemDG'
          : '-SP_eTomTat -lichSuThaoTac';

      return this.model
        .findOne({ SP_id: id, SP_trangThai: { $ne: 0 } })
        .select(select)
        .lean()
        .exec();
    }
  }

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

  async countAll(): Promise<{
    total: number;
    live: number;
    hidden: number;
  }> {
    const [total, live, hidden] = await Promise.all([
      this.model.countDocuments({ SP_trangThai: { $ne: 0 } }), // tổng: gồm hiện + ẩn
      this.model.countDocuments({ SP_trangThai: 1 }), // hiện
      this.model.countDocuments({ SP_trangThai: 2 }), // ẩn
    ]);

    return { total, live, hidden };
  }

  async count(filterType?: number): Promise<number> {
    const filter: any = {};

    if (filterType === 1) filter.SP_trangThai = 1;
    else if (filterType === 2) filter.SP_trangThai = 2;
    else filter.SP_trangThai = { $in: [1, 2] };

    return this.model.countDocuments(filter);
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
}
