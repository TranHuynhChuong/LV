import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SanPham, SanPhamDocument } from './sanPham.schema';
import { PaginateRepository, SortType } from 'src/Util/cursor-pagination';

export type SanPhamSortType = 1 | 2 | 3 | -1 | -2 | -3;

const project = {
  SP_id: 1,
  TL_id: 1,
  SP_ten: 1,
  SP_giaBan: 1,
  SP_doanhSo: 1,
  SP_khoHang: 1,
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

export interface SanPhamSummary {
  SP_id: number;
  TL_id: number;
  SP_ten: string;
  SP_giaBan: number;
  SP_doanhSo: number;
  SP_khoHang: number;
  SP_anh: string;
}

@Injectable()
export class SanPhamRepository extends PaginateRepository<SanPhamDocument> {
  constructor(
    @InjectModel(SanPham.name)
    model: Model<SanPhamDocument>
  ) {
    super(model);
  }

  protected getSanPhamSort(sortType: SanPhamSortType): [SortType, string] {
    switch (sortType) {
      case 1:
        return [{ SP_id: 1 }, 'SP_id'];
      case -1:
        return [{ SP_id: -1 }, 'SP_id'];
      case 2:
        return [{ SP_giaBan: 1, SP_id: 1 }, 'SP_giaBan'];
      case -2:
        return [{ SP_giaBan: -1, SP_id: -1 }, 'SP_giaBan'];
      case 3:
        return [{ SP_daBan: 1, SP_id: 1 }, 'SP_daBan'];
      case -3:
        return [{ SP_daBan: -1, SP_id: -1 }, 'SP_daBan'];
      default:
        return [{ SP_id: 1 }, 'SP_id'];
    }
  }

  protected buildFilter(
    filterType: 1 | 2 | 12,
    id?: number
  ): Record<string, any> {
    const filter: Record<string, any> = {};

    // Trạng thái sản phẩm
    if (filterType === 1) filter.SP_trangThai = 1;
    else if (filterType === 2) filter.SP_trangThai = 2;
    else filter.SP_trangThai = { $in: [1, 2] };

    // Lọc theo thể loại
    if (id !== undefined) {
      filter.SP_theLoai = { $in: [id] };
    }

    return filter;
  }

  protected async findAllPaginated(
    mode: 'head' | 'tail' | 'cursor',
    direction: 'forward' | 'back' = mode === 'tail' ? 'back' : 'forward',
    cursorId?: string,
    skip = 0,
    limit = 24,
    sortType: SanPhamSortType = 1,
    filterType: 1 | 2 | 12 = 12,
    keyword?: string,
    id?: number
  ): Promise<SanPhamSummary[]> {
    const [sort, sortField] = this.getSanPhamSort(sortType);
    const filter = this.buildFilter(filterType, id);
    let search: Record<string, any> | undefined;
    if (keyword) {
      search = this.findByKeyword(keyword);
    }
    const result = await this.paginateCursor({
      cursorId: cursorId ?? '',
      sort,
      sortField,
      skip,
      limit,
      filter,
      direction,
      idField: 'SP_id',
      project,
      mode,
      search,
    });

    return result as SanPhamSummary[];
  }

  async findAllForward(
    cursorId: string,
    skip = 0,
    limit = 24,
    sortType?: SanPhamSortType,
    filterType?: 1 | 2 | 12,
    keyword?: string,
    id?: number
  ) {
    return this.findAllPaginated(
      'cursor',
      'forward',
      cursorId,
      skip,
      limit,
      sortType,
      filterType,
      keyword,
      id
    );
  }

  async findAllBack(
    cursorId: string,
    skip = 0,
    limit = 24,
    sortType?: SanPhamSortType,
    filterType?: 1 | 2 | 12,
    keyword?: string,
    id?: number
  ) {
    return this.findAllPaginated(
      'cursor',
      'back',
      cursorId,
      skip,
      limit,
      sortType,
      filterType,
      keyword,
      id
    );
  }

  async findAllHead(
    limit = 24,
    sortType?: SanPhamSortType,
    filterType?: 1 | 2 | 12,
    keyword?: string,
    id?: number
  ) {
    return this.findAllPaginated(
      'head',
      undefined,
      '',
      0,
      limit,
      sortType,
      filterType,
      keyword,
      id
    );
  }

  async findAllTail(
    limit = 24,
    sortType?: SanPhamSortType,
    filterType?: 1 | 2 | 12,
    keyword?: string,
    id?: number
  ) {
    return this.findAllPaginated(
      'tail',
      undefined,
      '',
      0,
      limit,
      sortType,
      filterType,
      keyword,
      id
    );
  }

  async create(data: Partial<SanPham>): Promise<SanPham> {
    return this.model.create(data);
  }

  async findLastId(): Promise<number> {
    const last = await this.model.findOne().sort({ SP_id: -1 }).lean();
    return last?.SP_id ?? 0;
  }

  async findById(
    id: number,
    mode: 'default' | 'full' = 'default'
  ): Promise<SanPham | null> {
    const select =
      mode === 'default'
        ? '-SP_eNoiDung -lichSuThaoTac -SP_giaNhap'
        : '-SP_eNoiDung';

    return this.model
      .findOne({ SP_id: id, SP_trangThai: { $ne: 0 } })
      .select(select)
      .lean()
      .exec();
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

  async countAll(): Promise<{
    total: number;
    show: number;
    hidden: number;
  }> {
    const [total, show, hidden] = await Promise.all([
      this.model.countDocuments({ SP_trangThai: { $ne: 0 } }), // tổng: gồm hiện + ẩn
      this.model.countDocuments({ SP_trangThai: 1 }), // hiện
      this.model.countDocuments({ SP_trangThai: 2 }), // ẩn
    ]);

    return { total, show, hidden };
  }

  async count(filterType: 1 | 2 | 12): Promise<number> {
    const filter: any = {};

    if (filterType === 1) filter.SP_trangThai = 1;
    else if (filterType === 2) filter.SP_trangThai = 2;
    else filter.SP_trangThai = { $in: [1, 2] };

    return this.model.countDocuments(filter);
  }

  findByKeyword(keyword: string) {
    const search = {
      $search: {
        index: 'default',
        text: {
          query: keyword,
          path: ['SP_ten', 'SP_tacGia', 'SP_nhaXuatBan'],
          fuzzy: {
            maxEdits: 2,
            prefixLength: 1,
          },
        },
      },
    };

    return search;
  }

  async findByVector(queryVector: number[], limit = 5): Promise<any[]> {
    return this.model
      .aggregate([
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'SP_eNoiDung',
            queryVector, // Mảng số (vector)
            numCandidates: 100, // Số lượng bản ghi được xét để tìm top kết quả
            limit, // Số kết quả trả về
          },
        },
        { $limit: limit },
        {
          $project: project,
        },
      ])
      .exec();
  }
}
