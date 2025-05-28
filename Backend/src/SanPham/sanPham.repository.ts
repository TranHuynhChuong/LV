import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SanPham, SanPhamDocument } from './sanPham.schema';

@Injectable()
export class SanPhamRepository {
  constructor(
    @InjectModel(SanPham.name)
    private readonly model: Model<SanPhamDocument>
  ) {}

  async create(data: Partial<SanPham>): Promise<SanPham> {
    return this.model.create(data);
  }

  async findLastId(): Promise<number> {
    const last = await this.model.findOne().sort({ SP_id: -1 }).lean();
    return last?.SP_id ?? 0;
  }

  async findAll(
    page: number,
    limit: number,
    filterType: 1 | 2 | 12 = 12
  ): Promise<{ data: SanPham[]; total: number }> {
    let trangThaiQuery: any;

    switch (filterType) {
      case 1:
        trangThaiQuery = 1;
        break;
      case 2:
        trangThaiQuery = 2;
        break;
      case 12:
      default:
        trangThaiQuery = { $in: [1, 2] };
        break;
    }

    const skip = (page - 1) * limit;

    const matchStage = {
      $match: {
        SP_trangThai: trangThaiQuery,
      },
    };

    const facetStage = {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    };
    const projectStage = {
      $project: {
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
      },
    };
    const result = await this.model.aggregate([
      matchStage,
      projectStage,
      facetStage,
    ]);

    const data = result[0]?.data ?? [];
    const total = result[0]?.totalCount[0]?.count ?? 0;

    return { data, total };
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

  async countAll(): Promise<number> {
    return this.model.countDocuments({ SP_trangThai: { $ne: 0 } });
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
              path: 'SP_ten',
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
