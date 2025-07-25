import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, PipelineStage } from 'mongoose';
import { DanhGia, DanhGiaDocument } from '../schemas/danh-gia.schema';

import {
  PaginateResult,
  paginateRawAggregate,
} from 'src/Util/paginateWithFacet';

export type DanhGiaListResults = PaginateResult<DanhGiaDocument> & {
  rating?: {
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
  };
};

@Injectable()
export class DanhGiaRepository {
  constructor(
    @InjectModel(DanhGia.name)
    private readonly DanhGiaModel: Model<DanhGiaDocument>
  ) {}

  async create(
    data: Partial<DanhGia>,
    session?: ClientSession
  ): Promise<DanhGia> {
    const created = new this.DanhGiaModel(data);
    return created.save({ session });
  }

  async findOne(orderId: string, productId: number, customerId: number) {
    return this.DanhGiaModel.findOne({
      DH_id: orderId,
      S_id: productId,
      KH_id: customerId,
    }).lean();
  }

  async findAll(
    page: number,
    limit = 24,
    rating?: number,
    from?: Date,
    to?: Date,
    status?: 'all' | 'visible' | 'hidden'
  ): Promise<DanhGiaListResults> {
    const skip = (page - 1) * limit;
    const matchConditions: any = {};

    if (rating) {
      matchConditions.DG_diem = rating;
    }

    if (from && to) {
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);

      matchConditions.DG_ngayTao = { $gte: from, $lte: to };
    }

    if (status && status !== 'all') {
      matchConditions.DG_daAn = status === 'hidden';
    }

    const matchStage: PipelineStage.Match = { $match: matchConditions };

    const dataPipeline: PipelineStage[] = [
      matchStage,

      // Lookup khách hàng
      {
        $lookup: {
          from: 'khachhangs',
          localField: 'KH_id',
          foreignField: 'KH_id',
          as: 'khachHang',
        },
      },
      { $unwind: { path: '$khachHang', preserveNullAndEmptyArrays: true } },

      // Lookup sản phẩm
      {
        $lookup: {
          from: 'sanphams',
          localField: 'S_id',
          foreignField: 'S_id',
          as: 'sanPham',
        },
      },
      { $unwind: { path: '$sanPham', preserveNullAndEmptyArrays: true } },

      // Add tên khách và thông tin sản phẩm
      {
        $addFields: {
          KH_hoTen: '$khachHang.KH_hoTen',
          S_ten: '$sanPham.S_ten',
          S_anh: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: '$sanPham.S_anh',
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
      },

      // Xoá các mảng lookup thô
      {
        $project: {
          khachHang: 0,
          sanPham: 0,
        },
      },

      { $sort: { DG_ngayTao: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const countPipeline: PipelineStage[] = [matchStage, { $count: 'count' }];

    return paginateRawAggregate({
      model: this.DanhGiaModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  async findAllOfBook(
    spId: number,
    page: number,
    limit = 24
  ): Promise<DanhGiaListResults> {
    const skip = (page - 1) * limit;

    const matchStage: PipelineStage.Match = {
      $match: { S_id: spId, DG_daAn: false },
    };

    const dataPipeline: PipelineStage[] = [
      matchStage,
      {
        $lookup: {
          from: 'khachhangs',
          localField: 'KH_id',
          foreignField: 'KH_id',
          as: 'khachHang',
        },
      },
      { $unwind: { path: '$khachHang', preserveNullAndEmptyArrays: true } },
      { $addFields: { KH_hoTen: '$khachHang.KH_hoTen' } },
      { $project: { khachHang: 0 } },
      { $sort: { DG_ngayTao: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const countPipeline: PipelineStage[] = [matchStage, { $count: 'count' }];

    const result = await paginateRawAggregate({
      model: this.DanhGiaModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });

    const rating = await this.countRatingOfBook(spId);

    return {
      data: result.data as DanhGiaDocument[],
      rating,
      paginationInfo: result.paginationInfo,
    };
  }

  async getAverageRatingOfBook(
    spId: number,
    session?: ClientSession
  ): Promise<number> {
    type AvgRatingResult = { avgRating: number };

    const result = await this.DanhGiaModel.aggregate<AvgRatingResult>([
      { $match: { S_id: spId, DG_daAn: false } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$DG_diem' },
        },
      },
    ]).session(session ?? null);

    return result[0]?.avgRating ?? 0;
  }

  async countRatingOfBook(spId: number): Promise<{
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
  }> {
    const [result] = await this.DanhGiaModel.aggregate<{
      s1: number;
      s2: number;
      s3: number;
      s4: number;
      s5: number;
    }>([
      {
        $match: {
          S_id: spId,
          DG_daAn: false,
        },
      },
      {
        $group: {
          _id: null,
          s1: {
            $sum: {
              $cond: [{ $eq: ['$DG_diem', 1] }, 1, 0],
            },
          },
          s2: {
            $sum: {
              $cond: [{ $eq: ['$DG_diem', 2] }, 1, 0],
            },
          },
          s3: {
            $sum: {
              $cond: [{ $eq: ['$DG_diem', 3] }, 1, 0],
            },
          },
          s4: {
            $sum: {
              $cond: [{ $eq: ['$DG_diem', 4] }, 1, 0],
            },
          },
          s5: {
            $sum: {
              $cond: [{ $eq: ['$DG_diem', 5] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          s1: 1,
          s2: 1,
          s3: 1,
          s4: 1,
          s5: 1,
        },
      },
    ]);

    return (
      result ?? {
        s1: 0,
        s2: 0,
        s3: 0,
        s4: 0,
        s5: 0,
      }
    );
  }

  async countRating(
    from: Date,
    to: Date
  ): Promise<{
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
    totalOrders: number;
    hidden: number;
    visible: number;
  }> {
    const matchConditions: any = {};
    if (from && to) {
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);

      matchConditions.DG_ngayTao = { $gte: from, $lte: to };
    }
    const [result] = await this.DanhGiaModel.aggregate<{
      s1: number;
      s2: number;
      s3: number;
      s4: number;
      s5: number;
      totalOrders: number;
      hidden: number;
      visible: number;
    }>([
      {
        $match: matchConditions,
      },
      {
        $group: {
          _id: null,
          s1: { $sum: { $cond: [{ $eq: ['$DG_diem', 1] }, 1, 0] } },
          s2: { $sum: { $cond: [{ $eq: ['$DG_diem', 2] }, 1, 0] } },
          s3: { $sum: { $cond: [{ $eq: ['$DG_diem', 3] }, 1, 0] } },
          s4: { $sum: { $cond: [{ $eq: ['$DG_diem', 4] }, 1, 0] } },
          s5: { $sum: { $cond: [{ $eq: ['$DG_diem', 5] }, 1, 0] } },
          orderIds: { $addToSet: '$DH_id' },
          hidden: { $sum: { $cond: [{ $eq: ['$DG_daAn', true] }, 1, 0] } },
          visible: {
            $sum: { $cond: [{ $eq: ['$DG_daAn', false] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          s1: 1,
          s2: 1,
          s3: 1,
          s4: 1,
          s5: 1,
          hidden: 1,
          visible: 1,
          totalOrders: { $size: '$orderIds' },
        },
      },
    ]);

    return (
      result ?? {
        s1: 0,
        s2: 0,
        s3: 0,
        s4: 0,
        s5: 0,
        totalOrders: 0,
        hidden: 0,
        visible: 0,
      }
    );
  }

  async update(
    orderId: string,
    productId: number,
    customerId: number,
    status: boolean,
    history: any,
    session?: ClientSession
  ): Promise<DanhGia | null> {
    return this.DanhGiaModel.findOneAndUpdate(
      {
        DH_id: orderId,
        S_id: productId,
        KH_id: customerId,
      },
      {
        $set: { DG_daAn: status },
        $push: { lichSuThaoTac: history },
      },
      {
        new: true,
        session,
      }
    );
  }
}
