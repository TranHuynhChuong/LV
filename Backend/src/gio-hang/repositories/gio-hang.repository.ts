import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GioHang, GioHangDocument } from '../schemas/gio-hang.schema';

@Injectable()
export class GioHangRepository {
  constructor(
    @InjectModel(GioHang.name)
    private readonly GioHangModel: Model<GioHangDocument>
  ) {}

  /**
   * Tạo mới một mục giỏ hàng với thông tin khách hàng, sách và số lượng.
   * Tự động thêm thời gian hiện tại vào trường GH_thoiGian.
   *
   * @param data Dữ liệu giỏ hàng cần tạo:
   *  - KH_id: Mã khách hàng
   *  - S_id: Mã sách
   *  - GH_soLuong: Số lượng sách
   * @returns Promise trả về tài liệu GioHang vừa tạo
   */
  async create(data: {
    KH_id: number;
    S_id: number;
    GH_soLuong: number;
  }): Promise<GioHang> {
    const now = new Date();
    return this.GioHangModel.create({
      ...data,
      GH_thoiGian: now,
    });
  }

  /**
   * Cập nhật số lượng và thời gian cập nhật cho mục giỏ hàng dựa trên KH_id và S_id.
   * Trả về tài liệu GioHang đã được cập nhật.
   *
   * @param KH_id Mã khách hàng
   * @param S_id Mã sách
   * @param GH_soLuong Số lượng mới cập nhật
   * @returns Promise trả về tài liệu GioHang đã cập nhật hoặc null nếu không tìm thấy
   */
  async update(
    KH_id: number,
    S_id: number,
    GH_soLuong: number
  ): Promise<GioHang | null> {
    const now = new Date();
    return this.GioHangModel.findOneAndUpdate(
      { KH_id: KH_id, S_id: S_id },
      {
        GH_soLuong: GH_soLuong,
        GH_thoiGian: now,
      },
      { new: true }
    );
  }

  /**
   * Cập nhật đồng thời nhiều mục giỏ hàng bằng phương thức bulkWrite.
   * Chỉ cập nhật trường GH_soLuong, không thay đổi thời gian.
   *
   * @param items Mảng các đối tượng cần cập nhật, mỗi đối tượng gồm:
   *  - KH_id: Mã khách hàng
   *  - S_id: Mã sách
   *  - GH_soLuong: Số lượng mới
   * @returns Promise<void>
   */
  async updateMany(
    items: {
      KH_id: number;
      S_id: number;
      GH_soLuong: number;
    }[]
  ): Promise<void> {
    const operations = items.map((item) => ({
      updateOne: {
        filter: { KH_id: item.KH_id, S_id: item.S_id },
        update: {
          $set: { GH_soLuong: item.GH_soLuong },
        },
      },
    }));

    await this.GioHangModel.bulkWrite(operations);
  }

  /**
   * Xóa một mục giỏ hàng dựa trên KH_id và S_id.
   *
   * @param KH_id Mã khách hàng
   * @param S_id Mã sách
   * @returns Promise trả về tài liệu GioHang đã bị xóa hoặc null nếu không tìm thấy
   */
  async delete(KH_id: number, S_id: number): Promise<GioHang | null> {
    return this.GioHangModel.findOneAndDelete({ KH_id, S_id });
  }

  /**
   * Xóa nhiều mục giỏ hàng cùng lúc dựa trên KH_id và danh sách S_id.
   *
   * @param KH_id Mã khách hàng
   * @param S_ids Mảng mã sách cần xóa
   * @returns Promise trả về đối tượng chứa số lượng mục đã bị xóa { deletedCount }
   */
  async deleteMany(
    KH_id: number,
    S_ids: number[]
  ): Promise<{ deletedCount: number }> {
    const result = await this.GioHangModel.deleteMany({
      KH_id,
      S_id: { $in: S_ids },
    });
    return { deletedCount: result.deletedCount };
  }

  /**
   * Tìm tất cả mục giỏ hàng của khách hàng, sắp xếp giảm dần theo thời gian GH_thoiGian.
   *
   * @param KH_id Mã khách hàng
   * @returns Promise trả về mảng các tài liệu GioHang của khách hàng
   */
  async findAll(KH_id: number): Promise<GioHang[]> {
    return this.GioHangModel.find({ KH_id }).sort({ GH_thoiGian: -1 });
  }

  /**
   * Tìm một mục giỏ hàng dựa trên KH_id và S_id.
   *
   * @param KH_id Mã khách hàng
   * @param S_id Mã sách
   * @returns Promise trả về tài liệu GioHang nếu tìm thấy, hoặc null nếu không
   */
  async findOne(KH_id: number, S_id: number): Promise<GioHang | null> {
    return this.GioHangModel.findOne({ KH_id, S_id });
  }
}
