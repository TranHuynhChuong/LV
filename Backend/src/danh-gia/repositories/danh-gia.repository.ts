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

  async findById(id: string) {
    return this.DanhGiaModel.findById(id).lean();
  }

  async findAll(
    page: number,
    limit = 24,
    rating?: number,
    date?: Date
  ): Promise<DanhGiaListResults> {
    const skip = (page - 1) * limit;

    const matchConditions: any = {};

    if (rating) {
      matchConditions.DG_diem = rating;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      matchConditions.DG_ngayTao = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const matchStage: PipelineStage.Match = {
      $match: matchConditions,
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

    return paginateRawAggregate({
      model: this.DanhGiaModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  async findAllOfProduct(
    spId: number,
    page: number,
    limit = 24
  ): Promise<DanhGiaListResults> {
    const skip = (page - 1) * limit;

    const matchStage: PipelineStage.Match = {
      $match: { SP_id: spId, DG_daAn: false },
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

    const rating = await this.countRatingOfProduct(spId);

    return {
      data: result.data as DanhGiaDocument[],
      rating,
      paginationInfo: result.paginationInfo,
    };
  }

  async getAverageRatingOfProduct(
    spId: number,
    session?: ClientSession
  ): Promise<number> {
    type AvgRatingResult = { avgRating: number };

    const result = await this.DanhGiaModel.aggregate<AvgRatingResult>([
      { $match: { SP_id: spId, DG_daAn: false } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$DG_diem' },
        },
      },
    ]).session(session ?? null);

    return result[0]?.avgRating ?? 0;
  }

  async countRatingOfProduct(spId: number): Promise<{
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
          SP_id: spId,
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

  async countRatingOfMonth(
    startDate: Date,
    endDate: Date
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
        $match: {
          DG_ngayTao: {
            $gte: startDate,
            $lt: endDate,
          },
        },
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

  async update(id: string, update: Partial<DanhGia>) {
    return this.DanhGiaModel.findByIdAndUpdate(id, update, { new: true });
  }

  async deleteById(id: string) {
    return this.DanhGiaModel.findByIdAndDelete(id);
  }
}
