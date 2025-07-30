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

  /**
   * Tạo bản ghi liên kết giữa một đơn hàng và các mã giảm giá đã áp dụng.
   *
   * @param dhId Mã định danh của đơn hàng.
   * @param mgIds Mảng mã định danh của các mã giảm giá.
   * @param session (Tùy chọn) Phiên làm việc MongoDB để hỗ trợ transaction.
   * @returns Danh sách các bản ghi đã được thêm vào.
   */
  async create(orderId: string, voucherIds: string[], session?: ClientSession) {
    const data = voucherIds.map((voucherId) => ({
      DH_id: orderId,
      MG_id: voucherId,
    }));
    return this.MaGiamDonHangModel.insertMany(data, { session });
  }

  /**
   * Thống kê số lượng đơn hàng đã sử dụng mã giảm giá và thống kê theo loại mã giảm giá.
   *
   * - Truy vấn thực hiện hai pipeline song song:
   *   - Pipeline 1: Join với collection `magiams`, nhóm theo `MG_loai`, đếm số lượng từng loại.
   *   - Pipeline 2: Nhóm theo `DH_id` duy nhất để biết số đơn hàng có dùng mã giảm.
   *
   * @param orderIds Danh sách mã đơn hàng cần thống kê.
   * @returns
   * - `orderUsed`: số lượng đơn hàng có sử dụng ít nhất một mã giảm giá.
   * - `typeStats`: đối tượng thống kê số lượng mã giảm giá theo loại (vd: `order`, `shipping`).
   */
  async getVoucherStats(orderIds: string[]) {
    const [typeResult, usedResult] = await Promise.all([
      this.MaGiamDonHangModel.aggregate([
        { $match: { DH_id: { $in: orderIds } } },
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
        { $match: { DH_id: { $in: orderIds } } },
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
