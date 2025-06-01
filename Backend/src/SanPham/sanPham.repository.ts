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

  private getSanPhamSort(sortType: SanPhamSortType): [SortType, string] {
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

  private buildFilter(filterType: 1 | 2 | 12): Record<string, any> {
    if (filterType === 1) return { SP_trangThai: 1 };
    if (filterType === 2) return { SP_trangThai: 2 };
    return { SP_trangThai: { $in: [1, 2] } };
  }

  async create(data: Partial<SanPham>): Promise<SanPham> {
    return this.model.create(data);
  }

  async findLastId(): Promise<number> {
    const last = await this.model.findOne().sort({ SP_id: -1 }).lean();
    return last?.SP_id ?? 0;
  }

  async findAllForward(
    cursorId: string,
    skip: number,
    limit: number,
    sortType: SanPhamSortType = 1,
    filterType: 1 | 2 | 12 = 12
  ): Promise<SanPhamSummary[]> {
    const [sort, sortField] = this.getSanPhamSort(sortType);

    const filter = this.buildFilter(filterType);

    const result = await this.paginateCursor({
      cursorId,
      sort,
      sortField,
      skip,
      limit,
      filter,
      direction: 'forward',
      idField: 'SP_id',
      project,
    });

    return result as SanPhamSummary[];
  }

  async findAllBack(
    cursorId: string,
    skip: number,
    limit: number,
    sortType: SanPhamSortType = 1,
    filterType: 1 | 2 | 12 = 12
  ): Promise<SanPhamSummary[]> {
    const [sort, sortField] = this.getSanPhamSort(sortType);

    const filter = this.buildFilter(filterType);

    const result = await this.paginateCursor({
      cursorId,
      sort,
      sortField,
      skip,
      limit,
      filter,
      direction: 'back',
      idField: 'SP_id',
      project,
    });

    return result as SanPhamSummary[];
  }

  async findById(id: number): Promise<SanPham | null> {
    return this.model
      .findOne({ SP_id: id, SP_trangThai: { $ne: 0 } })
      .select('-SP_eNoiDung')
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

  async findByName(
    keyword: string,
    page: number,
    limit: number
  ): Promise<any[]> {
    const skip = (page - 1) * limit;

    return this.model
      .aggregate([
        {
          $search: {
            index: 'default',
            text: {
              query: keyword,
              path: 'SP_ten SP_tacGia SP_nhaXuatBan',
              fuzzy: {
                maxEdits: 2,
                prefixLength: 1,
              },
            },
          },
        },
        {
          $match: { SP_trangThai: 1 },
        },
        { $sort: { score: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            SP_id: 1,
            TL_id: 1,
            SP_ten: 1,
            SP_giaBan: 1,
            SP_doanhSo: 1,
            SP_khoHang: 1,
            score: { $meta: 'searchScore' },
            SP_anh: {
              $first: {
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
            },
            _id: 0,
          },
        },
      ])
      .exec();
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
          $project: {
            SP_id: 1,
            TL_id: 1,
            SP_ten: 1,
            SP_giaBan: 1,
            SP_doanhSo: 1,
            SP_khoHang: 1,
            score: { $meta: 'searchScore' },
            SP_anh: {
              $first: {
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
            },
            _id: 0,
          },
        },
      ])
      .exec();
  }
}
