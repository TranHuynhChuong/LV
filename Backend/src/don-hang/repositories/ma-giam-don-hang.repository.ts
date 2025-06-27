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

  async getDiscountCodeStats(dhIds: string[]) {
    const result = await this.MaGiamDonHangModel.aggregate([
      {
        $match: {
          DH_id: { $in: dhIds },
        },
      },
      {
        $lookup: {
          from: 'magiams', // Tên collection chứa mã giảm
          localField: 'MG_id',
          foreignField: 'MG_id',
          as: 'maGiam',
        },
      },
      {
        $unwind: '$maGiam',
      },
      {
        $group: {
          _id: '$maGiam.MG_loai', // Giả sử là 'shipping' hoặc 'invoice'
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
    ]);

    // Đưa về dạng object nếu cần
    const stats: Record<string, number> = {};
    for (const item of result) {
      stats[item.type] = item.count;
    }

    return stats;
  }
}
