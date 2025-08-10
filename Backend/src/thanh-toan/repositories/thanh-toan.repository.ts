import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { ThanhToan, ThanhToanDocument } from '../schemas/thanh-toan.schema';

@Injectable()
export class ThanhToanRepository {
  constructor(
    @InjectModel(ThanhToan.name)
    private readonly thanhToanModel: Model<ThanhToanDocument>
  ) {}

  /**
   * Tạo mới bản ghi ThanhToan
   * @param data dữ liệu thanh toán
   * @param session phiên giao dịch mongoose session (có thể null)
   */
  async create(
    data: Partial<ThanhToan>,
    session?: ClientSession
  ): Promise<ThanhToan> {
    const created = new this.thanhToanModel(data);
    return session ? created.save({ session }) : created.save();
  }

  /**
   * Cập nhật trạng thái TT_daThanhToan
   * @param orderId id đơn hàng
   * @param status trạng thái thanh toán
   */
  async updateStatus(
    transId: string,
    status: boolean
  ): Promise<ThanhToan | null> {
    return this.thanhToanModel
      .findOneAndUpdate(
        { TT_id: transId },
        {
          TT_daThanhToan: status,
        },
        { new: true }
      )
      .exec();
  }

  /**
   * Cập nhật trạng thái TT_daThanhToan
   * @param orderId id đơn hàng
   * @param status trạng thái thanh toán
   */
  async update(
    orderId: string,
    status?: boolean,
    transId?: string
  ): Promise<ThanhToan | null> {
    return this.thanhToanModel
      .findOneAndUpdate(
        { DH_id: orderId },
        {
          ...(status !== undefined ? { TT_daThanhToan: status } : {}),
          ...(transId !== undefined ? { TT_id: transId } : {}),
        },
        { new: true }
      )
      .exec();
  }

  /**
   * Tìm thanh toán theo id
   * @param id mã thanh toán TT_id
   */
  async findByById(id: string): Promise<ThanhToan | null> {
    return this.thanhToanModel.findOne({ TT_id: id }).exec();
  }

  /**
   * Tìm thanh toán theo DH_id
   * @param orderId mã đơn hàng
   */
  async findByByOrderId(orderId: string): Promise<ThanhToan | null> {
    return this.thanhToanModel.findOne({ DH_id: orderId }).exec();
  }
}
