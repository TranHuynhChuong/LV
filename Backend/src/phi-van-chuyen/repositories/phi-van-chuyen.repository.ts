import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import {
  PhiVanChuyen,
  PhiVanChuyenDocument,
} from '../schemas/phi-van-chuyen.schema';

@Injectable()
export class PhiVanChuyenRepository {
  constructor(
    @InjectModel(PhiVanChuyen.name)
    private readonly PhiVanChuyenModel: Model<PhiVanChuyenDocument>
  ) {}

  /**
   * Tạo bản ghi phí vận chuyển mới.
   *
   * @param data - Dữ liệu phí vận chuyển cần tạo.
   * @param session - (Tuỳ chọn) phiên giao dịch mongoose.
   * @returns Bản ghi phí vận chuyển sau khi tạo.
   */
  async create(data: any, session?: ClientSession): Promise<PhiVanChuyen> {
    const created = new this.PhiVanChuyenModel(data);
    return created.save({ session });
  }

  /**
   * Lấy giá trị PVC_id lớn nhất hiện tại (ID cuối cùng).
   *
   * @param session - (Tuỳ chọn) phiên giao dịch mongoose.
   * @returns ID cuối cùng, hoặc 0 nếu không có bản ghi.
   */
  async findLastId(session?: ClientSession): Promise<number> {
    const result = await this.PhiVanChuyenModel.find({})
      .sort({ PVC_id: -1 })
      .limit(1)
      .select('PVC_id')
      .session(session ?? null)
      .lean()
      .exec();

    return result.length > 0 ? result[0].PVC_id : 0;
  }

  /**
   * Trả về danh sách tất cả phí vận chuyển chưa bị xoá.
   *
   * @returns Mảng các bản ghi phí vận chuyển (chỉ trường cần thiết).
   */
  async findAll(): Promise<Partial<PhiVanChuyen>[]> {
    return this.PhiVanChuyenModel.find({ PVC_daXoa: false })
      .select('PVC_phi PVC_ntl PVC_phuPhi PVC_dvpp T_id PVC_id')
      .lean()
      .exec();
  }

  /**
   * Tìm phí vận chuyển theo ID tỉnh.
   *
   * @param id - ID tỉnh cần tìm.
   * @returns Bản ghi phí vận chuyển tương ứng hoặc null nếu không tìm thấy.
   */
  async findByProvinceId(id: number): Promise<PhiVanChuyen | null> {
    return this.PhiVanChuyenModel.findOne({ T_id: id, PVC_daXoa: false })
      .select('-lichSuThaoTac')
      .lean()
      .exec();
  }

  /**
   * Tìm phí vận chuyển theo ID phí vận chuyển.
   *
   * @param id - PVC_id cần tìm.
   * @returns Bản ghi phí vận chuyển tương ứng hoặc null nếu không tìm thấy.
   */
  async findById(id: number): Promise<PhiVanChuyen | null> {
    return this.PhiVanChuyenModel.findOne({ PVC_id: id, PVC_daXoa: false })
      .lean()
      .exec();
  }

  /**
   * Cập nhật thông tin phí vận chuyển theo PVC_id.
   *
   * @param id - PVC_id của bản ghi cần cập nhật.
   * @param data - Dữ liệu cập nhật.
   * @returns Bản ghi sau khi được cập nhật hoặc null nếu không tìm thấy.
   */
  async update(
    id: number,
    data: any,
    session?: ClientSession
  ): Promise<PhiVanChuyen | null> {
    return this.PhiVanChuyenModel.findOneAndUpdate({ PVC_id: id }, data, {
      new: true,
      session,
    })

      .exec();
  }

  /**
   * Đánh dấu bản ghi phí vận chuyển là đã xoá (xóa mềm).
   *
   * @param id - PVC_id của bản ghi cần xóa.
   * @returns Bản ghi sau khi cập nhật trạng thái đã xoá hoặc null nếu không tìm thấy.
   */
  async delete(
    id: number,
    session?: ClientSession
  ): Promise<PhiVanChuyen | null> {
    return this.PhiVanChuyenModel.findOneAndUpdate(
      { PVC_id: id },
      { PVC_daXoa: true },
      { new: true, session }
    )

      .exec();
  }

  /**
   * Đếm số lượng bản ghi phí vận chuyển chưa bị xoá.
   *
   * @returns Tổng số bản ghi còn hiệu lực.
   */
  async countAll(): Promise<number> {
    return this.PhiVanChuyenModel.countDocuments({ PVC_daXoa: false }).exec();
  }
}
