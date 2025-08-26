import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, PipelineStage, UpdateQuery } from 'mongoose';
import { KhachHang, KhachHangDocument } from '../schemas/khach-hang.schema';
import {
  PaginateResult,
  paginateRawAggregate,
} from 'src/Util/paginateWithFacet';

export type CustomerListResults = PaginateResult<KhachHangDocument>;

@Injectable()
export class KhachHangRepository {
  constructor(
    @InjectModel(KhachHang.name)
    private readonly KhachHangModel: Model<KhachHangDocument>
  ) {}

  /**
   * Tạo mới khách hàng.
   * @param createDto Dữ liệu khách hàng cần tạo.
   * @param session Phiên giao dịch MongoDB (tùy chọn).
   * @returns Đối tượng khách hàng sau khi đã lưu.
   */
  async create(createDto: any, session?: ClientSession): Promise<KhachHang> {
    const created = new this.KhachHangModel(createDto);
    return created.save({ session });
  }

  /**
   * Lấy danh sách khách hàng có phân trang.
   * @param page Số trang.
   * @param limit Số lượng bản ghi mỗi trang (mặc định 24).
   * @returns Kết quả phân trang chứa danh sách khách hàng và tổng số bản ghi.
   */
  async findAll(page: number, limit = 24): Promise<CustomerListResults> {
    const skip = (page - 1) * limit;

    const dataPipeline: PipelineStage[] = [
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];
    const countPipeline: PipelineStage[] = [{ $count: 'count' }];
    return paginateRawAggregate({
      model: this.KhachHangModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  /**
   * Tìm khách hàng theo email.
   * @param email Địa chỉ email của khách hàng.
   * @returns Đối tượng khách hàng tương ứng hoặc null nếu không tìm thấy.
   */
  async findByEmail(email: string): Promise<KhachHang | null> {
    return this.KhachHangModel.findOne({ KH_email: email }).lean().exec();
  }

  /**
   * Tìm khách hàng theo ID.
   * @param id Mã định danh KH_id.
   * @returns Đối tượng khách hàng tương ứng hoặc null nếu không tìm thấy.
   */
  async findById(id: number): Promise<KhachHang | null> {
    return this.KhachHangModel.findOne({ KH_id: id }).lean().exec();
  }

  /**
   * Cập nhật thông tin khách hàng.
   * @param id Mã định danh KH_id của khách hàng.
   * @param data Dữ liệu cần cập nhật.
   * @returns Khách hàng sau khi cập nhật hoặc null nếu không tìm thấy.
   */
  async update(id: number, data: any): Promise<KhachHang | null> {
    const update: UpdateQuery<KhachHang> = { $set: data };
    return this.KhachHangModel.findOneAndUpdate({ KH_id: id }, update, {
      new: true,
      runValidators: true,
    }).exec();
  }

  /**
   * Cập nhật địa chỉ email cho khách hàng.
   * @param id Mã định danh KH_id của khách hàng.
   * @param newEmail Email mới cần cập nhật.
   * @returns Khách hàng sau khi cập nhật hoặc null nếu không tìm thấy.
   */
  async updateEmail(id: number, newEmail: string): Promise<KhachHang | null> {
    return this.KhachHangModel.findOneAndUpdate(
      { KH_id: id },
      { KH_email: newEmail },
      {
        new: true,
      }
    ).exec();
  }

  /**
   * Xóa khách hàng khỏi hệ thống.
   * (Hiện đang chỉ định nghĩa lại mà chưa xóa thực sự dữ liệu.)
   * @param id Mã định danh KH_id của khách hàng.
   * @returns Đối tượng khách hàng bị xóa hoặc null nếu không tìm thấy.
   */
  async delete(id: number): Promise<KhachHang | null> {
    return this.KhachHangModel.findOneAndUpdate({ KH_id: id }).exec();
  }

  /**
   * Đếm tổng số khách hàng hiện có.
   * @returns Tổng số lượng khách hàng.
   */
  async countAll(): Promise<number> {
    return this.KhachHangModel.countDocuments().exec();
  }

  /**
   * Đếm số khách hàng theo từng tháng trong năm hiện tại.
   * @param year Năm cần thống kê.
   * @param countsByMonth Mảng chứa kết quả, mỗi phần tử ứng với số khách trong tháng.
   * @returns Mảng gồm số lượng khách hàng theo từng tháng (từ tháng 1 đến 12).
   */
  async countByMonthInCurrentYear(
    year: number,
    countsByMonth: number[]
  ): Promise<number[]> {
    const result = await this.KhachHangModel.aggregate([
      {
        $match: {
          KH_ngayTao: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$KH_ngayTao' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    result.forEach((item) => {
      countsByMonth[item.month - 1] = item.count;
    });
    return countsByMonth;
  }
}
