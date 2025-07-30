import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import {
  ChiTietKhuyenMai,
  ChiTietKhuyenMaiDocument,
} from '../schemas/chi-tiet-khuyen-mai.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChiTietKhuyenMaiRepository {
  constructor(
    @InjectModel(ChiTietKhuyenMai.name)
    private readonly ChiTietKhuyenMaiModel: Model<ChiTietKhuyenMaiDocument>
  ) {}

  /**
   * Tìm các chi tiết khuyến mãi hợp lệ theo danh sách mã sách
   * - Chi tiết chưa bị xoá, chưa bị tạm ngưng
   * - Khuyến mãi đang trong khoảng thời gian hiệu lực
   * @param ids Mảng mã sách (S_id)
   * @returns Mảng chi tiết khuyến mãi thoả điều kiện
   */
  async findValidByBookIds(ids: number[]) {
    const now = new Date();
    return this.ChiTietKhuyenMaiModel.aggregate([
      {
        $match: {
          S_id: { $in: ids },
          CTKM_daXoa: false,
          CTKM_tamNgung: false,
        },
      },
      {
        $lookup: {
          from: 'khuyenmais',
          localField: 'KM_id',
          foreignField: 'KM_id',
          as: 'khuyenMai',
        },
      },
      { $unwind: '$khuyenMai' },
      {
        $match: {
          'khuyenMai.KM_batDau': { $lte: now },
          'khuyenMai.KM_ketThuc': { $gte: now },
        },
      },
      {
        $project: {
          KM_id: 1,
          S_id: 1,
          CTKM_theoTyLe: 1,
          CTKM_giaTri: 1,
          CTKM_tamNgung: 1,
          CTKM_giaSauGiam: 1,
        },
      },
    ]);
  }

  /**
   * Lấy tất cả chi tiết khuyến mãi theo mã khuyến mãi (KM_id)
   * Chỉ lấy các chi tiết chưa bị xoá
   * @param id Mã khuyến mãi
   * @param session Phiên giao dịch MongoDB (tuỳ chọn)
   * @returns Mảng chi tiết khuyến mãi dưới dạng plain object
   */
  async findAllByPromotionId(
    id: number,
    session?: ClientSession
  ): Promise<ChiTietKhuyenMai[]> {
    return this.ChiTietKhuyenMaiModel.find({ KM_id: id, CTKM_daXoa: false })
      .session(session ?? null)
      .lean()
      .exec();
  }

  /**
   * Tạo nhiều chi tiết khuyến mãi mới
   * @param data Mảng dữ liệu chi tiết khuyến mãi cần tạo
   * @param session Phiên giao dịch MongoDB (tuỳ chọn)
   * @returns Mảng chi tiết khuyến mãi đã được tạo
   */
  async create(data: Partial<ChiTietKhuyenMai>[], session?: ClientSession) {
    return this.ChiTietKhuyenMaiModel.insertMany(data, { session });
  }

  /**
   * Cập nhật chi tiết khuyến mãi theo mã sách và mã khuyến mãi
   * Chỉ cập nhật chi tiết chưa bị xoá
   * @param bookId Mã sách
   * @param promotionId Mã khuyến mãi
   * @param update Dữ liệu cập nhật
   * @param session Phiên giao dịch MongoDB (tuỳ chọn)
   * @returns Chi tiết khuyến mãi sau cập nhật hoặc null nếu không tìm thấy
   */
  async update(
    bookId: number,
    promotionId: number,
    update: Partial<ChiTietKhuyenMai>,
    session?: ClientSession
  ) {
    return this.ChiTietKhuyenMaiModel.findOneAndUpdate(
      { S_id: bookId, KM_id: promotionId, CTKM_daXoa: false },
      update,
      { new: true, session }
    );
  }

  /**
   * Cập nhật giá sau giảm của sách trong chi tiết khuyến mãi
   * @param bookId Mã sách
   * @param promotionId Mã khuyến mãi
   * @param giaSauGiam Giá đã giảm
   * @param session Phiên giao dịch MongoDB (tuỳ chọn)
   * @returns Chi tiết khuyến mãi sau cập nhật hoặc null nếu không tìm thấy
   */
  async updateSalePriceForBooks(
    bookId: number,
    promotionId: number,
    giaSauGiam: number,
    session?: ClientSession
  ) {
    return this.ChiTietKhuyenMaiModel.findOneAndUpdate(
      { S_id: bookId, KM_id: promotionId, CTKM_daXoa: false },
      {
        $set: {
          CTKM_giaSauGiam: giaSauGiam,
        },
      },
      { new: true, session }
    );
  }

  /**
   * Đánh dấu chi tiết khuyến mãi là đã xoá (mềm) theo mã khuyến mãi và mã sách
   * @param promotionId Mã khuyến mãi
   * @param bookId Mã sách
   * @param session Phiên giao dịch MongoDB (tuỳ chọn)
   * @returns Kết quả cập nhật
   */
  async remove(promotionId: number, bookId: number, session?: ClientSession) {
    return this.ChiTietKhuyenMaiModel.updateOne(
      { KM_id: promotionId, S_id: bookId },
      { CTKM_daXoa: true },
      { session }
    );
  }

  /**
   * Xoá chi tiết khuyến mãi theo mã khuyến mãi (xóa cứng)
   * @param promotionId Mã khuyến mãi
   * @param session Phiên giao dịch MongoDB (tuỳ chọn)
   * @returns Kết quả xoá
   */
  async delete(promotionId: number, session?: ClientSession) {
    return this.ChiTietKhuyenMaiModel.deleteOne(
      { KM_id: promotionId },
      { session }
    );
  }
}
