import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import {
  TTNhanHangKH,
  TTNhanHangKHDocument,
} from '../schemas/tt-nhan-hang-kh.schema';

@Injectable()
export class TTNhanHangKHRepository {
  constructor(
    @InjectModel(TTNhanHangKH.name)
    private readonly NHkhachHangModel: Model<TTNhanHangKHDocument>
  ) {}

  /**
   * Tạo mới thông tin nhận hàng cho khách hàng.
   *
   * @param data - Dữ liệu thông tin nhận hàng.
   * @param session - (Tùy chọn) Phiên giao dịch MongoDB để sử dụng trong transaction.
   * @returns Thông tin nhận hàng vừa được tạo.
   */
  async create(data: Partial<TTNhanHangKH>, session?: ClientSession) {
    return this.NHkhachHangModel.create([{ ...data }], { session }).then(
      (res) => res[0]
    );
  }

  /**
   * Lấy tất cả địa chỉ nhận hàng của một khách hàng.
   *
   * @param id - Mã khách hàng.
   * @param session - (Tùy chọn) Phiên giao dịch MongoDB.
   * @returns Danh sách thông tin nhận hàng của khách hàng.
   */
  async findAll(id: number, session?: ClientSession) {
    return this.NHkhachHangModel.find({ KH_id: id })
      .session(session ?? null)
      .lean();
  }

  /**
   * Tìm địa chỉ nhận hàng theo mã địa chỉ và mã khách hàng.
   *
   * @param id - Mã địa chỉ nhận hàng.
   * @param userId - Mã khách hàng.
   * @param session - (Tùy chọn) Phiên giao dịch MongoDB.
   * @returns Thông tin địa chỉ nhận hàng tương ứng, hoặc null nếu không tìm thấy.
   */
  async findById(id: number, userId: number, session?: ClientSession) {
    return this.NHkhachHangModel.findOne({ NH_id: id, KH_id: userId })
      .session(session ?? null)
      .lean();
  }

  /**
   * Cập nhật thông tin địa chỉ nhận hàng của khách hàng.
   *
   * @param id - Mã địa chỉ nhận hàng.
   * @param userId - Mã khách hàng.
   * @param data - Dữ liệu cần cập nhật.
   * @param session - (Tùy chọn) Phiên giao dịch MongoDB.
   * @returns Thông tin sau khi cập nhật.
   */
  async update(
    id: number,
    userId: number,
    data: Partial<TTNhanHangKH>,
    session?: ClientSession
  ) {
    return this.NHkhachHangModel.findOneAndUpdate(
      { NH_id: id, KH_id: userId },
      data,
      {
        new: true,
        session,
      }
    );
  }

  /**
   * Bỏ đánh dấu mặc định của các địa chỉ khác thuộc cùng một khách hàng.
   *
   * @param id - Mã địa chỉ không bị ảnh hưởng (ngoại trừ).
   * @param userId - Mã khách hàng.
   * @param session - (Tùy chọn) Phiên giao dịch MongoDB.
   * @returns Kết quả cập nhật (số lượng bản ghi bị ảnh hưởng).
   */
  async unsetDefaultOthers(
    id: number,
    userId: number,
    session?: ClientSession
  ) {
    return this.NHkhachHangModel.updateMany(
      {
        KH_id: userId,
        NH_id: { $ne: id },
      },
      {
        $set: { NH_macDinh: false },
      },
      { session }
    );
  }

  /**
   * Xoá địa chỉ nhận hàng theo mã địa chỉ và mã khách hàng.
   *
   * @param id - Mã địa chỉ nhận hàng.
   * @param userId - Mã khách hàng.
   * @param session - (Tùy chọn) Phiên giao dịch MongoDB.
   * @returns Kết quả xoá (số lượng bản ghi bị xoá).
   */
  async delete(id: number, userId: number, session?: ClientSession) {
    return this.NHkhachHangModel.deleteOne(
      { NH_id: id, KH_id: userId },
      { session }
    );
  }

  /**
   * Tìm mã địa chỉ nhận hàng lớn nhất của một khách hàng.
   *
   * @param userId - Mã khách hàng.
   * @param session - (Tùy chọn) Phiên giao dịch MongoDB.
   * @returns Mã địa chỉ lớn nhất, hoặc 0 nếu chưa có địa chỉ nào.
   */
  async findLastId(userId: number, session?: ClientSession) {
    const last = await this.NHkhachHangModel.findOne({ KH_id: userId })
      .sort({ NH_id: -1 })
      .select('NH_id')
      .session(session ?? null)
      .lean();
    return last?.NH_id ?? 0;
  }
}
