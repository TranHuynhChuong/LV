import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, PipelineStage } from 'mongoose';
import { KhuyenMai, KhuyenMaiDocument } from '../schemas/khuyen-mai.schema';
import { Injectable } from '@nestjs/common';
import { paginateRawAggregate } from 'src/Util/paginateWithFacet';

/**Trạng thái khuyến mãi */
export enum PromotionFilterType {
  Expired = 'expired', // Hết hạn
  NotEnded = 'notEnded', // Chưa hết hạn
  Active = 'active', // Đang diễn ra
}

@Injectable()
export class KhuyenMaiRepository {
  constructor(
    @InjectModel(KhuyenMai.name)
    private readonly KhuyenMaiModel: Model<KhuyenMaiDocument>
  ) {}

  /**
   * Lấy bộ lọc theo loại khuyến mãi
   * @param filterType Loại bộ lọc (Expired, NotEnded, Active)
   * @returns Điều kiện lọc dùng trong truy vấn MongoDB
   */
  protected getFilter(filterType?: PromotionFilterType): Record<string, any> {
    const now = new Date();
    switch (filterType) {
      case PromotionFilterType.Expired:
        return { KM_ketThuc: { $lt: now } };
      case PromotionFilterType.NotEnded:
        return { KM_ketThuc: { $gte: now } };
      case PromotionFilterType.Active:
        return {
          KM_batDau: { $lte: now },
          KM_ketThuc: { $gte: now },
        };
      default:
        return {};
    }
  }

  /**
   * Lấy danh sách khuyến mãi có phân trang, kèm lọc theo trạng thái
   * @param param.page Trang cần lấy
   * @param param.limit Số lượng phần tử mỗi trang
   * @param param.filterType Loại bộ lọc khuyến mãi (tuỳ chọn)
   * @returns Đối tượng phân trang gồm dữ liệu và tổng số
   */
  async findAll({
    page,
    limit,
    filterType,
  }: {
    page: number;
    limit: number;
    filterType?: PromotionFilterType;
  }) {
    const filter = this.getFilter(filterType);
    const dataPipeline: PipelineStage[] = [
      { $match: filter },
      {
        $lookup: {
          from: 'chitietkhuyenmais',
          localField: 'KM_id',
          foreignField: 'KM_id',
          as: 'chiTietList',
        },
      },
      {
        $addFields: {
          KM_slTong: { $size: '$chiTietList' },
        },
      },

      {
        $project: {
          lichSuThaoTac: 0,
          chiTietList: 0,
        },
      },
      { $sort: { KM_batDau: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];
    const countPipeline: PipelineStage[] = [
      { $match: filter },
      { $count: 'count' },
    ];
    return paginateRawAggregate<KhuyenMaiDocument>({
      model: this.KhuyenMaiModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  /**
   * Tìm khuyến mãi theo mã (KM_id)
   * @param id Mã khuyến mãi
   * @param session Phiên giao dịch MongoDB (tuỳ chọn)
   * @returns Đối tượng KhuyenMai hoặc null nếu không tìm thấy
   */
  async findById(id: number, session?: ClientSession) {
    return this.KhuyenMaiModel.findOne({ KM_id: id })
      .session(session ?? null)
      .exec();
  }

  /**
   * Tìm khuyến mãi theo mã và lấy chi tiết kèm theo, lọc theo trạng thái
   * @param id Mã khuyến mãi
   * @param filterType Loại bộ lọc trạng thái khuyến mãi (tuỳ chọn)
   * @returns Đối tượng KhuyenMai với chi tiết kèm theo hoặc null nếu không tìm thấy
   */
  async findAndGetDetailById(
    id: number,
    filterType?: PromotionFilterType
  ): Promise<KhuyenMaiDocument | null> {
    const filter = this.getFilter(filterType);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          KM_id: id,
          ...filter,
        },
      },
      {
        $lookup: {
          from: 'chitietkhuyenmais',
          localField: 'KM_id',
          foreignField: 'KM_id',
          as: 'chiTietKhuyenMai',
        },
      },
      {
        $set: {
          chiTietKhuyenMai: {
            $filter: {
              input: '$chiTietKhuyenMai',
              as: 'ct',
              cond: true,
            },
          },
        },
      },
      {
        $set: {
          S_ids: {
            $map: {
              input: '$chiTietKhuyenMai',
              as: 'ct',
              in: '$$ct.S_id',
            },
          },
        },
      },
      {
        $lookup: {
          from: 'saches',
          let: { s_ids: '$S_ids' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$S_id', '$$s_ids'] },
                    { $ne: ['$S_trangThai', 'daXoa'] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                S_id: 1,
                S_ten: 1,
                S_giaBan: 1,
                S_tonKho: 1,
                S_giaNhap: 1,
                S_anh: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: '$S_anh',
                            as: 'anh',
                            cond: { $eq: ['$$anh.A_anhBia', true] },
                          },
                        },
                        as: 'anh',
                        in: '$$anh.A_url',
                      },
                    },
                    0,
                  ],
                },
              },
            },
          ],
          as: 'saches',
        },
      },
      {
        $project: {
          _id: 0,
          KM_id: 1,
          KM_ten: 1,
          KM_moTa: 1,
          KM_batDau: 1,
          KM_ketThuc: 1,
          lichSuThaoTac: 1,
          chiTietKhuyenMai: 1,
          saches: 1,
        },
      },
    ];

    const result = await this.KhuyenMaiModel.aggregate(pipeline);
    return (result[0] ?? null) as KhuyenMaiDocument | null;
  }

  /**
   * Lấy danh sách các mã khuyến mãi chưa kết thúc (theo thời gian hiện tại)
   * @param session Phiên giao dịch MongoDB (tuỳ chọn)
   * @returns Mảng số các KM_id chưa kết thúc
   */
  async findAllNotEndedIds(session?: ClientSession): Promise<number[]> {
    const now = new Date();
    const result = await this.KhuyenMaiModel.find(
      { KM_ketThuc: { $gte: now } },
      { _id: 0, KM_id: 1 }
    )
      .session(session ?? null)
      .lean()
      .exec();
    return result.map((item) => item.KM_id);
  }

  /**
   * Tạo mới một khuyến mãi
   * @param data Dữ liệu khuyến mãi partial
   * @param session Phiên giao dịch MongoDB (tuỳ chọn)
   * @returns Đối tượng khuyến mãi vừa tạo
   */
  async create(data: Partial<KhuyenMai>, session?: ClientSession) {
    return this.KhuyenMaiModel.create([{ ...data }], { session }).then(
      (res) => res[0]
    );
  }

  /**
   * Xóa khuyến mãi theo mã
   * @param id Mã khuyến mãi cần xóa
   * @param session Phiên giao dịch MongoDB (tuỳ chọn)
   * @returns true nếu có bản ghi bị xóa, false nếu không
   */
  async delete(id: number, session?: ClientSession): Promise<boolean> {
    const result = await this.KhuyenMaiModel.findOneAndDelete({
      KM_id: id,
    }).session(session ?? null);
    return !!result;
  }

  /**
   * Tìm mã khuyến mãi lớn nhất hiện có
   * @param session Phiên giao dịch MongoDB (tuỳ chọn)
   * @returns Số mã lớn nhất hoặc 0 nếu chưa có
   */
  async findLastId(session?: ClientSession): Promise<number> {
    const result = await this.KhuyenMaiModel.find({})
      .sort({ KM_id: -1 })
      .limit(1)
      .select('KM_id')
      .session(session ?? null)
      .lean()
      .exec();

    return result.length > 0 ? result[0].KM_id : 0;
  }

  /**
   * Cập nhật thông tin khuyến mãi theo mã
   * @param id Mã khuyến mãi cần cập nhật
   * @param update Dữ liệu cập nhật partial
   * @param session Phiên giao dịch MongoDB (tuỳ chọn)
   * @returns Đối tượng khuyến mãi sau cập nhật hoặc null nếu không tìm thấy
   */
  async update(
    id: number,
    update: Partial<KhuyenMai>,
    session?: ClientSession
  ) {
    return this.KhuyenMaiModel.findOneAndUpdate({ KM_id: id }, update, {
      new: true,
      session,
    });
  }

  /**
   * Đếm số lượng khuyến mãi còn hiệu lực (đang hoạt động)
   * @returns Số lượng khuyến mãi còn hiệu lực
   */
  async countValid(): Promise<number> {
    const now = new Date();
    return this.KhuyenMaiModel.countDocuments({
      KM_batDau: { $lte: now },
      KM_ketThuc: { $gte: now },
    });
  }
}
