import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, PipelineStage } from 'mongoose';
import { MaGiam, MaGiamDocument } from '../schemas/ma-giam.schema';
import { Injectable } from '@nestjs/common';
import { paginateRawAggregate } from 'src/Util/paginateWithFacet';
/**
 * Kiểu lọc mã giảm giá (hết hạn, chưa kết thúc, đang hoạt động).
 */
export enum VoucherFilterType {
  /** Hết hạn */
  Expired = 'expired',
  /** Chưa hết hạn */
  NotEnded = 'notEnded',
  /** Đang hoạt động */
  Active = 'active',
}

/**
 * Kiểu lọc loại mã giảm giá (tất cả, vận chuyển, hóa đơn).
 */
export enum VoucherType {
  /** Vận chuyển */
  Shipping = 'vc',
  /** Hóa đơn - tiền hàng */
  Order = 'hd',
  /** Tất cả */
  All = 'all',
}

@Injectable()
export class MaGiamRepository {
  constructor(
    @InjectModel(MaGiam.name)
    private readonly MaGiamModel: Model<MaGiamDocument>
  ) {}

  /**
   * Tạo bộ lọc theo trạng thái hiệu lực và loại mã giảm giá.
   *
   * @param filterType Kiểu lọc mã giảm giá (hết hạn, chưa kết thúc, đang hoạt động).
   * @param type Loại mã giảm giá (vận chuyển, hóa đơn, tất cả).
   * @returns Đối tượng điều kiện truy vấn MongoDB.
   */
  protected getFilter(
    filterType?: VoucherFilterType,
    type?: VoucherType
  ): Record<string, any> {
    const filter: Record<string, any> = {};
    const now = new Date();
    switch (filterType) {
      case VoucherFilterType.NotEnded:
        filter.MG_ketThuc = { $gte: now };
        break;
      case VoucherFilterType.Expired:
        filter.MG_ketThuc = { $lt: now };
        break;
      case VoucherFilterType.Active:
        filter.MG_batDau = { $lte: now };
        filter.MG_ketThuc = { $gte: now };
        break;
    }
    if (type && type !== VoucherType.All) {
      filter.MG_loai = type;
    }
    return filter;
  }

  /**
   * Lấy danh sách mã giảm giá có phân trang và lọc.
   *
   * @param param0 Đối tượng chứa thông tin phân trang và điều kiện lọc.
   * @param param0.page Số trang hiện tại (bắt đầu từ 1).
   * @param param0.limit Số lượng bản ghi mỗi trang.
   * @param param0.filterType Loại lọc theo trạng thái mã giảm giá: đã hết hạn, đang hoạt động, hoặc chưa kết thúc.
   * @param param0.type Loại mã giảm giá: theo đơn hàng, theo vận chuyển, hoặc tất cả.
   *
   * @returns Kết quả bao gồm danh sách dữ liệu và tổng số bản ghi.
   */
  async findAll({
    page,
    limit,
    filterType,
    type,
  }: {
    page: number;
    limit: number;
    filterType?: VoucherFilterType;
    type?: VoucherType;
  }) {
    const filter = this.getFilter(filterType, type);
    const dataPipeline: PipelineStage[] = [
      { $match: filter },
      {
        $project: {
          lichSuThaoTac: 0,
        },
      },
      { $sort: { MG_batDau: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];
    const countPipeline: PipelineStage[] = [
      { $match: filter },
      { $count: 'count' },
    ];
    return paginateRawAggregate<MaGiamDocument>({
      model: this.MaGiamModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  /**
   * Lấy danh sách các mã giảm giá còn hiệu lực.
   *
   * @returns Danh sách mã giảm giá đang hoạt động.
   */
  async findAllValid() {
    const filter = this.getFilter(VoucherFilterType.Active);
    return this.MaGiamModel.find(filter)
      .select('-lichSuThaoTac')
      .sort({ MG_batDau: -1 })
      .lean();
  }

  /**
   * Tìm mã giảm giá theo MG_id.
   *
   * @param id Mã giảm giá.
   * @returns Tài liệu mã giảm giá nếu tồn tại.
   */
  async findExisting(id: string) {
    return this.MaGiamModel.findOne({ MG_id: id }).exec();
  }

  /**
   * Lấy mã giảm giá theo ID và bộ lọc.
   *
   * @param id Mã giảm giá.
   * @param filterType Kiểu lọc.
   * @param type Loại mã giảm giá.
   * @returns Mã giảm giá nếu tồn tại.
   */
  async findById(
    id: string,
    filterType?: VoucherFilterType,
    type?: VoucherType
  ): Promise<MaGiam | null> {
    const filter = this.getFilter(filterType, type);
    const pipeline: PipelineStage[] = [
      {
        $match: {
          MG_id: id,
          ...filter,
        },
      },
    ];
    const result = await this.MaGiamModel.aggregate(pipeline);
    return (result[0] ?? null) as MaGiam | null;
  }

  /**
   * Tạo mã giảm giá mới.
   *
   * @param data Dữ liệu mã giảm giá.
   * @returns Mã giảm giá vừa tạo.
   */
  async create(data: Partial<MaGiam>, session?: ClientSession) {
    const created = new this.MaGiamModel(data);
    return created.save({ session });
  }

  /**
   * Cập nhật thông tin mã giảm giá.
   *
   * @param id Mã định danh của mã giảm giá.
   * @param update Dữ liệu cần cập nhật.
   * @returns Mã giảm giá đã được cập nhật.
   */
  async update(id: string, update: Partial<MaGiam>, session?: ClientSession) {
    return this.MaGiamModel.findOneAndUpdate({ MG_id: id }, update, {
      new: true,
      session,
    });
  }

  /**
   * Xóa mã giảm giá theo ID.
   *
   * @param id Mã định danh của mã giảm giá.
   * @returns `true` nếu xóa thành công, ngược lại `false`.
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.MaGiamModel.findOneAndDelete({ MG_id: id });
    return !!result;
  }

  /**
   * Đếm tổng số mã giảm giá còn hiệu lực hiện tại.
   *
   * @returns Số lượng mã giảm giá đang hoạt động.
   */
  async countValid(): Promise<number> {
    const now = new Date();
    return this.MaGiamModel.countDocuments({
      MG_batDau: { $lte: now },
      MG_ketThuc: { $gte: now },
    });
  }

  /**
   * Kiểm tra và lọc các mã giảm giá trong danh sách đang còn hiệu lực.
   *
   * @param ids Danh sách mã giảm giá cần kiểm tra.
   * @returns Danh sách mã giảm giá hợp lệ.
   */
  async checkValid(ids: string[]): Promise<MaGiam[]> {
    const now = new Date();
    return this.MaGiamModel.find({
      MG_id: { $in: ids },
      MG_batDau: { $lte: now },
      MG_ketThuc: { $gte: now },
    }).exec();
  }
}
