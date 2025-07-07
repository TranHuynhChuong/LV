import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';

import {
  MaGiamDonHang,
  MaGiamDonHangDocument,
} from '../schemas/ma-giam-don-hang.schema';

@Injectable()
export class MaGiamDonHangRepository {
  constructor(
    @InjectModel(MaGiamDonHang.name)
    private readonly MaGiamDonHangModel: Model<MaGiamDonHangDocument>
  ) {}

  // Tạo mã giảm giá đơn hàng
  async create(dhId: string, mgIds: string[], session?: ClientSession) {
    const data = mgIds.map((mgId) => ({
      DH_id: dhId,
      MG_id: mgId,
    }));
    return this.MaGiamDonHangModel.insertMany(data, { session });
  }

  async getVoucherStats(dhIds: string[]) {
    const [typeResult, usedResult] = await Promise.all([
      this.MaGiamDonHangModel.aggregate([
        { $match: { DH_id: { $in: dhIds } } },
        {
          $lookup: {
            from: 'magiams',
            localField: 'MG_id',
            foreignField: 'MG_id',
            as: 'maGiam',
          },
        },
        { $unwind: { path: '$maGiam', preserveNullAndEmptyArrays: false } },

        {
          $group: {
            _id: '$maGiam.MG_loai',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            type: '$_id',
            count: 1,
          },
        },
      ]),

      this.MaGiamDonHangModel.aggregate([
        { $match: { DH_id: { $in: dhIds } } },
        {
          $group: {
            _id: '$DH_id',
          },
        },
        {
          $count: 'orderUsed',
        },
      ]),
    ]);

    const TYPE_LABELS: Record<string, string> = {
      vc: 'shipping',
      hd: 'order',
    };

    const typeStats: Record<string, number> = {};
    for (const item of typeResult) {
      const key = TYPE_LABELS[item.type] ?? item.type;
      typeStats[key] = item.count;
    }

    return {
      orderUsed: usedResult[0]?.orderUsed ?? 0,
      typeStats,
    };
  }
}
