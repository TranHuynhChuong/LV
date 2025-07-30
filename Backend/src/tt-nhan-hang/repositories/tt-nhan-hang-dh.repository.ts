import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import {
  TTNhanHangDH,
  TTNhanHangDHDocument,
} from '../schemas/tt-nhan-hang-dh.schema';

@Injectable()
export class TTNhanHangDHRepository {
  constructor(
    @InjectModel(TTNhanHangDH.name)
    private readonly TTNhanHangDHModel: Model<TTNhanHangDHDocument>
  ) {}

  /**
   * Tạo mới thông tin nhận hàng cho đơn hàng.
   *
   * @param data - Dữ liệu thông tin nhận hàng của đơn hàng.
   * @param session - (Tùy chọn) Phiên giao dịch MongoDB để dùng trong transaction.
   * @returns Thông tin nhận hàng vừa được tạo.
   */
  async createDH(data: Partial<TTNhanHangDH>, session?: ClientSession) {
    return this.TTNhanHangDHModel.create([{ ...data }], { session }).then(
      (res) => res[0]
    );
  }

  /**
   * Tìm thông tin nhận hàng của đơn hàng dựa trên mã đơn hàng.
   *
   * @param orderId - Mã đơn hàng.
   * @returns Thông tin nhận hàng tương ứng, hoặc null nếu không tồn tại.
   */
  async findByDHId(orderId: string): Promise<TTNhanHangDH | null> {
    return this.TTNhanHangDHModel.findOne({ DH_id: orderId }).lean().exec();
  }

  /**
   * Thống kê số lượng đơn hàng theo từng tỉnh dựa trên danh sách mã đơn hàng.
   *
   * @param orderIds - Danh sách mã đơn hàng cần thống kê.
   * @returns Danh sách đối tượng gồm ID tỉnh và số lượng đơn hàng tương ứng.
   */
  async getStatsByProvince(
    orderIds: string[]
  ): Promise<{ provinceId: number; count: number }[]> {
    const stats = await this.TTNhanHangDHModel.aggregate([
      { $match: { DH_id: { $in: orderIds } } },
      {
        $group: {
          _id: '$T_id',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          provinceId: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);
    return stats as { provinceId: number; count: number }[];
  }
}
