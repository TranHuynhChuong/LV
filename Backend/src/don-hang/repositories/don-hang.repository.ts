import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, PipelineStage } from 'mongoose';

import {
  DonHang,
  DonHangDocument,
  TrangThaiDonHang,
} from '../schemas/don-hang.schema';
import { paginateRawAggregate } from 'src/Util/paginateWithFacet';

// Enum trạng thái đơn hàng để sử dụng lọc và phân tích
export enum OrderStatus {
  All = 'all',
  Pending = 'pending',
  ToShip = 'toShip',
  Shipping = 'shipping',
  Complete = 'complete',
  InComplete = 'inComplete',
  CancelRequest = 'cancelRequest',
  Canceled = 'canceled',
}

// Mapping OrderStatus => TrangThaiDonHang thực tế
const OrderStatusMap: Record<OrderStatus, TrangThaiDonHang | undefined> = {
  [OrderStatus.All]: undefined,
  [OrderStatus.Pending]: TrangThaiDonHang.ChoXacNhan,
  [OrderStatus.ToShip]: TrangThaiDonHang.ChoVanChuyen,
  [OrderStatus.Shipping]: TrangThaiDonHang.DangVanChuyen,
  [OrderStatus.Complete]: TrangThaiDonHang.GiaoThanhCong,
  [OrderStatus.InComplete]: TrangThaiDonHang.GiaoThatBai,
  [OrderStatus.CancelRequest]: TrangThaiDonHang.YeuCauHuy,
  [OrderStatus.Canceled]: TrangThaiDonHang.DaHuy,
};

@Injectable()
export class DonHangRepository {
  constructor(
    @InjectModel(DonHang.name)
    private readonly DonHangModel: Model<DonHangDocument>
  ) {}

  /**
   * Tạo một đơn hàng mới trong cơ sở dữ liệu.
   *
   * @param {Partial<DonHang>} data - Dữ liệu đơn hàng cần tạo. Có thể thiếu một số trường vì là Partial.
   * @param {ClientSession} [session] - Phiên giao dịch MongoDB (transaction) nếu có.
   * @returns {Promise<DonHangDocument>} Đơn hàng mới vừa được tạo.
   */
  async create(data: Partial<DonHang>, session?: ClientSession) {
    return this.DonHangModel.create([{ ...data }], { session }).then(
      (res) => res[0]
    );
  }

  /**
   * Tìm ID đơn hàng gần nhất (có giá trị DH_id lớn nhất) từ cơ sở dữ liệu.
   *
   * @returns {Promise<string | null>} DH_id của đơn hàng gần nhất, hoặc null nếu không tìm thấy.
   */
  async findLastId(): Promise<string | null> {
    const lastDonHang = await this.DonHangModel.findOne()
      .sort({ DH_id: -1 })
      .select('DH_id')
      .lean();

    return lastDonHang?.DH_id ?? null;
  }

  /**
   * Tạo pipeline MongoDB để truy vấn và tổng hợp thông tin đơn hàng kèm các thông tin liên quan:
   * chi tiết đơn hàng, sách, trạng thái giao hàng và đánh giá.
   *
   * @param {Record<string, any>} [filter] - Điều kiện lọc `$match`,  theo `DH_id`, `KH_id`, `DH_trangThai`, v.v.
   * @returns {PipelineStage[]} Mảng pipeline phục vụ cho aggregation MongoDB.
   */
  protected getOrderPipeline(filter?: Record<string, any>): PipelineStage[] {
    const pipeline: PipelineStage[] = [];
    if (filter && Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter });
    }
    pipeline.push({ $project: { _id: 0, DH_id: 1 } });
    return pipeline;
  }

  // 1️⃣ Hàm trả pipeline chi tiết sách & thông tin nhận hàng, không có match
  protected getOrderDetailPipelineCore(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'chitietdonhangs',
          localField: 'DH_id',
          foreignField: 'DH_id',
          as: 'chiTietDonHang',
        },
      },
      {
        $unwind: { path: '$chiTietDonHang', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'saches',
          localField: 'chiTietDonHang.S_id',
          foreignField: 'S_id',
          as: 'sach',
        },
      },
      { $unwind: { path: '$sach', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'ttnhanhangdhs',
          localField: 'DH_id',
          foreignField: 'DH_id',
          as: 'nhanHang',
        },
      },
      { $unwind: { path: '$nhanHang', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          DH_id: { $first: '$DH_id' },
          DH_ngayTao: { $first: '$DH_ngayTao' },
          DH_ngayCapNhat: { $first: '$DH_ngayCapNhat' },
          DH_trangThai: { $first: '$DH_trangThai' },
          DH_giamHD: { $first: '$DH_giamHD' },
          DH_giamVC: { $first: '$DH_giamVC' },
          DH_phiVC: { $first: '$DH_phiVC' },
          DH_HD: { $first: '$DH_HD' },
          KH_id: { $first: '$KH_id' },
          KH_email: { $first: '$KH_email' },
          thongTinNhanHang: { $first: '$nhanHang' },
          chiTietDonHang: {
            $push: {
              S_id: '$chiTietDonHang.S_id',
              CTDH_soLuong: '$chiTietDonHang.CTDH_soLuong',
              CTDH_giaMua: '$chiTietDonHang.CTDH_giaMua',
              CTDH_giaBan: '$chiTietDonHang.CTDH_giaBan',
              CTDH_giaNhap: '$chiTietDonHang.CTDH_giaNhap',
              S_ten: '$sach.S_ten',
              S_anh: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: '$sach.S_anh',
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
              S_trangThai: '$sach.S_trangThai',
            },
          },
        },
      },
    ];
  }

  protected getOrderDetailPipeline(ids: string[]): PipelineStage[] {
    return [
      { $match: { DH_id: { $in: ids } } },
      ...this.getOrderDetailPipelineCore(),
    ];
  }

  /**
   * Tạo điều kiện lọc cho truy vấn đơn hàng trong MongoDB Aggregation Pipeline.
   *
   * @param {OrderStatus} [filterType] - Loại trạng thái đơn hàng (hoàn tất, chờ xử lý, v.v.).
   * @param {string} [orderId] - Mã đơn hàng cụ thể để lọc.
   * @param {Date} [from] - Ngày bắt đầu của khoảng thời gian lọc.
   * @param {Date} [to] - Ngày kết thúc của khoảng thời gian lọc.
   * @param {number} [userId] - ID khách hàng cần lọc.
   * @returns {Record<string, any>} Điều kiện lọc phù hợp với yêu cầu đầu vào.
   * @remarks
   * - Nếu `filterType` là `Complete` hoặc `InComplete`, lọc theo trạng thái giao thành công hoặc giao thất bại.
   * - Nếu có `from` và `to`, lọc theo ngày tạo đơn hàng nằm trong khoảng đó.
   * - Các trạng thái đơn hàng được ánh xạ thông qua `OrderStatusMap` và `TrangThaiDonHang`.
   */
  protected getFilter(
    filterType?: OrderStatus,
    orderId?: string,
    from?: Date,
    to?: Date,
    userId?: number
  ): Record<string, any> {
    const filter: Record<string, any> = {};
    const status = filterType ? OrderStatusMap[filterType] : undefined;
    if (status) {
      if (
        filterType === OrderStatus.Complete ||
        filterType === OrderStatus.InComplete
      ) {
        filter.DH_trangThai = {
          $in: [TrangThaiDonHang.GiaoThanhCong, TrangThaiDonHang.GiaoThatBai],
        };
      } else {
        filter.DH_trangThai = status;
      }
    }
    if (orderId) {
      filter.DH_id = orderId;
    }
    if (userId) {
      filter.KH_id = userId;
    }
    if (from && to) {
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      filter.DH_ngayCapNhat = { $gte: from, $lte: to };
    }
    return filter;
  }

  /**
   * Truy vấn danh sách đơn hàng với phân trang, lọc theo trạng thái, khoảng thời gian, mã đơn và người dùng.
   *
   * @param {Object} options - Tuỳ chọn truy vấn đơn hàng.
   * @param {number} options.page - Số trang hiện tại (bắt đầu từ 1).
   * @param {number} options.limit - Số lượng đơn hàng mỗi trang (mặc định là 12).
   * @param {OrderStatus} [options.filterType] - Trạng thái đơn hàng cần lọc.
   * @param {string} [options.orderId] - Mã đơn hàng cụ thể cần truy vấn.
   * @param {Date} [options.from] - Ngày bắt đầu của khoảng thời gian lọc.
   * @param {Date} [options.to] - Ngày kết thúc của khoảng thời gian lọc.
   * @param {number} [options.userId] - ID của khách hàng cần lọc.
   * @returns  Kết quả truy vấn phân trang từ MongoDB aggregation pipeline.
   */
  async findAll(options: {
    page: number;
    limit: number;
    filterType?: OrderStatus;
    orderId?: string;
    from?: Date;
    to?: Date;
    userId?: number;
  }) {
    const { page, limit = 12, filterType, orderId, from, to, userId } = options;
    const filter = this.getFilter(filterType, orderId, from, to, userId);
    const pipeline = [...this.getOrderPipeline(filter)];
    const countPipeline = [...pipeline, { $count: 'count' }];
    const dataPipeline: PipelineStage[] = [...pipeline];
    const skip = (page - 1) * limit;
    dataPipeline.push({ $sort: { DH_ngayCapNhat: -1 } });
    dataPipeline.push({ $skip: skip }, { $limit: limit });
    const { data, paginationInfo } = await paginateRawAggregate({
      model: this.DonHangModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
    let orders: any[] = [];
    if (data && data.length > 0) {
      const ids = data.map((item: { DH_id: string }) => item.DH_id);
      const detailPipeline = this.getOrderDetailPipeline(ids);
      orders = await this.DonHangModel.aggregate(detailPipeline).exec();
    }

    return {
      data: orders,
      paginationInfo,
    };
  }

  /**
   * Truy vấn chi tiết đơn hàng theo mã đơn hàng và trạng thái (nếu có).
   *
   * @param {string} orderId - Mã định danh của đơn hàng cần tìm.
   * @param {OrderStatus} [filterType] - Trạng thái đơn hàng cần lọc (nếu có).
   * @returns {Promise<any>} Trả về thông tin chi tiết đơn hàng nếu tìm thấy, ngược lại trả về `null`.
   */
  async findById(orderId: string, filterType?: OrderStatus): Promise<any> {
    const filter = this.getFilter(filterType);

    const pipeline: PipelineStage[] = [
      { $match: { DH_id: orderId, ...filter } },
      ...this.getOrderDetailPipelineCore(),
    ];

    const result = await this.DonHangModel.aggregate(pipeline).exec();

    return result && result.length > 0 ? result[0] : null;
  }

  /**
   * Truy vấn đơn hàng theo mã đơn hàng (DH_id) mà không lấy các bảng liên quan.
   *
   * @param {string} id - Mã định danh của đơn hàng cần truy vấn.
   * @returns {Promise<DonHang | null>} Trả về đối tượng đơn hàng nếu tìm thấy, ngược lại trả về `null`.
   */
  async getById(id: string): Promise<DonHang | null> {
    return this.DonHangModel.findOne({ DH_id: id }).exec();
  }

  /**
   * Cập nhật trạng thái đơn hàng và ghi lại lịch sử thao tác (nếu có).
   *
   * @param {string} DH_id - Mã định danh của đơn hàng cần cập nhật.
   * @param {OrderStatus} status - Trạng thái mới của đơn hàng (được ánh xạ từ enum OrderStatus sang giá trị trong DB).
   * @param {ClientSession} [session] - (Tuỳ chọn) Phiên giao dịch MongoDB dùng để đảm bảo tính nhất quán khi thực hiện cập nhật.
   * @returns {Promise<DonHang | null>} Trả về đơn hàng sau khi cập nhật nếu tồn tại, ngược lại trả về `null`.
   */
  async update(
    DH_id: string,
    status: OrderStatus,
    session?: ClientSession
  ): Promise<DonHang | null> {
    const updateQuery: any = {
      DH_trangThai: OrderStatusMap[status],
      DH_ngayCapNhat: new Date(),
    };
    const updateOps: any = {
      $set: updateQuery,
    };
    return this.DonHangModel.findOneAndUpdate({ DH_id }, updateOps, {
      new: true,
      session,
    });
  }

  /**
   * Đếm tổng số đơn hàng theo từng trạng thái trong khoảng thời gian chỉ định (nếu có).
   *
   * @param {Date} [from] - (Tuỳ chọn) Ngày bắt đầu để lọc các đơn hàng theo thời gian tạo.
   * @param {Date} [to] - (Tuỳ chọn) Ngày kết thúc để lọc các đơn hàng theo thời gian tạo.
   * @returns {Promise<{
   *   total: number;
   *   pending: number;
   *   toShip: number;
   *   shipping: number;
   *   complete: number;
   *   inComplete: number;
   *   cancelRequest: number;
   *   canceled: number;
   * }>} Trả về thống kê số lượng đơn hàng theo từng trạng thái:
   *   - `total`: Tổng số đơn hàng.
   *   - `pending`: Đơn hàng chờ xác nhận.
   *   - `toShip`: Đơn hàng chờ vận chuyển.
   *   - `shipping`: Đơn hàng đang được vận chuyển.
   *   - `complete`: Đơn hàng giao thành công.
   *   - `inComplete`: Đơn hàng giao thất bại.
   *   - `cancelRequest`: Đơn hàng có yêu cầu huỷ.
   *   - `canceled`: Đơn hàng đã huỷ.
   */
  async countAll(
    from?: Date,
    to?: Date
  ): Promise<{
    total: number;
    pending: number;
    toShip: number;
    shipping: number;
    complete: number;
    inComplete: number;
    cancelRequest: number;
    canceled: number;
  }> {
    const match: any = {};
    if (from && to) {
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      match.DH_ngayCapNhat = { $gte: from, $lte: to };
    }
    type GroupResult = { _id: string; count: number };
    const result: GroupResult[] = await this.DonHangModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$DH_trangThai',
          count: { $sum: 1 },
        },
      },
    ]);
    const stats: Record<string, number> = {};
    result.forEach((r) => {
      stats[r._id] = r.count;
    });
    const total = result.reduce((sum, r) => sum + r.count, 0);
    return {
      total,
      pending: stats[TrangThaiDonHang.ChoXacNhan] || 0,
      toShip: stats[TrangThaiDonHang.ChoVanChuyen] || 0,
      shipping: stats[TrangThaiDonHang.DangVanChuyen] || 0,
      complete: stats[TrangThaiDonHang.GiaoThanhCong] || 0,
      inComplete: stats[TrangThaiDonHang.GiaoThatBai] || 0,
      cancelRequest: stats[TrangThaiDonHang.YeuCauHuy] || 0,
      canceled: stats[TrangThaiDonHang.DaHuy] || 0,
    };
  }

  /**
   * Thống kê đơn hàng theo từng mốc thời gian (ngày, tháng hoặc năm) và trạng thái đơn hàng.
   *
   * @param {Date} from - Ngày bắt đầu khoảng thời gian cần thống kê.
   * @param {Date} to - Ngày kết thúc khoảng thời gian cần thống kê.
   * @param {'day' | 'month' | 'year'} groupBy - Đơn vị thống kê theo thời gian: `'day'`, `'month'` hoặc `'year'`.
   * @returns {Promise<Record<string, {
   *   total: {
   *     all: number;
   *     complete: number;
   *     inComplete: number;
   *     canceled: number;
   *   };
   *   complete: {
   *     orderIds: string[];
   *     stats: {
   *       totalBillSale: number;
   *       totalShipSale: number;
   *       totalShipPrice: number;
   *     };
   *   };
   *   inComplete: {
   *     orderIds: string[];
   *     stats: {
   *       totalBillSale: number;
   *       totalShipSale: number;
   *       totalShipPrice: number;
   *     };
   *   };
   * }>>} Trả về thống kê số lượng đơn hàng theo từng mốc thời gian:
   *   - `total`: Thống kê tổng số đơn hàng theo trạng thái.
   *     - `all`: Tổng số đơn hàng.
   *     - `complete`: Số đơn giao thành công.
   *     - `inComplete`: Số đơn giao thất bại.
   *     - `canceled`: Số đơn đã hủy.
   *   - `complete`: Thống kê chi tiết đơn hoàn thành.
   *     - `orderIds`: Danh sách ID đơn hàng hoàn tất.
   *     - `stats`: Thống kê doanh thu và phí vận chuyển.
   *   - `inComplete`: Thống kê chi tiết đơn chưa hoàn thành.
   *     - `orderIds`: Danh sách ID đơn hàng thất bại.
   *     - `stats`: Thống kê doanh thu và phí vận chuyển.
   */
  async getOrderStatsByStatus(
    from: Date,
    to: Date,
    groupBy: 'day' | 'month' | 'year'
  ): Promise<
    Record<
      string,
      {
        total: {
          all: number;
          complete: number;
          inComplete: number;
          canceled: number;
        };
        complete: {
          orderIds: string[];
          stats: {
            totalBillSale: number;
            totalShipSale: number;
            totalShipPrice: number;
          };
        };
        inComplete: {
          orderIds: string[];
          stats: {
            totalBillSale: number;
            totalShipSale: number;
            totalShipPrice: number;
          };
        };
      }
    >
  > {
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    const dateFormat =
      groupBy === 'year' ? '%Y' : groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';
    const allRaw = await this.DonHangModel.aggregate([
      {
        $match: {
          DH_ngayCapNhat: { $gte: from, $lte: to },
        },
      },
      {
        $project: {
          dateGroup: {
            $dateToString: { format: dateFormat, date: '$DH_ngayCapNhat' },
          },
        },
      },
      {
        $group: {
          _id: '$dateGroup',
          total: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    const raw = await this.DonHangModel.aggregate([
      {
        $match: {
          DH_ngayCapNhat: { $gte: from, $lte: to },
          DH_trangThai: { $in: ['GiaoThanhCong', 'GiaoThatBai', 'DaHuy'] },
        },
      },
      {
        $project: {
          DH_id: 1,
          DH_trangThai: 1,
          DH_giamHD: 1,
          DH_giamVC: 1,
          DH_phiVC: 1,
          dateGroup: {
            $dateToString: { format: dateFormat, date: '$DH_ngayCapNhat' },
          },
        },
      },
      {
        $group: {
          _id: { date: '$dateGroup', status: '$DH_trangThai' },
          total: { $sum: 1 },
          orderIds: { $addToSet: '$DH_id' },
          billSale: { $sum: '$DH_giamHD' },
          shipSale: { $sum: '$DH_giamVC' },
          shipPrice: { $sum: '$DH_phiVC' },
        },
      },
    ]);
    const result: Record<string, any> = {};
    for (const item of allRaw) {
      const date = item._id;
      result[date] = {
        total: {
          all: item.total,
          complete: 0,
          inComplete: 0,
          canceled: 0,
        },
        complete: {
          orderIds: [],
          stats: { totalBillSale: 0, totalShipSale: 0, totalShipPrice: 0 },
        },
        inComplete: {
          orderIds: [],
          stats: { totalBillSale: 0, totalShipSale: 0, totalShipPrice: 0 },
        },
      };
    }
    for (const item of raw) {
      const date = item._id.date;
      const status = item._id.status;
      result[date] ??= {
        total: {
          all: 0,
          complete: 0,
          inComplete: 0,
          canceled: 0,
        },
        complete: {
          orderIds: [],
          stats: { totalBillSale: 0, totalShipSale: 0, totalShipPrice: 0 },
        },
        inComplete: {
          orderIds: [],
          stats: { totalBillSale: 0, totalShipSale: 0, totalShipPrice: 0 },
        },
      };
      switch (status) {
        case 'GiaoThanhCong':
          result[date].total.complete = item.total;
          result[date].complete.orderIds = item.orderIds;
          result[date].complete.stats = {
            totalBillSale: item.billSale,
            totalShipSale: item.shipSale,
            totalShipPrice: item.shipPrice,
          };
          break;
        case 'GiaoThatBai':
          result[date].total.inComplete = item.total;
          result[date].inComplete.orderIds = item.orderIds;
          result[date].inComplete.stats = {
            totalBillSale: item.billSale,
            totalShipSale: item.shipSale,
            totalShipPrice: item.shipPrice,
          };
          break;
        case 'DaHuy':
          result[date].total.canceled = item.total;
          break;
      }
    }
    return result;
  }

  /**
   * Thống kê số lượng đơn hàng theo loại khách hàng (thành viên hoặc khách vãng lai)
   * trong khoảng thời gian được chỉ định và có trạng thái là giao thành công hoặc thất bại.
   *
   * @param from - Ngày bắt đầu tính thống kê (sẽ được đặt về đầu ngày: 00:00:00).
   * @param to - Ngày kết thúc tính thống kê (sẽ được đặt về cuối ngày: 23:59:59).
   * @returns Đối tượng chứa số lượng đơn hàng phân theo loại khách hàng:
   *  - 'member': khách hàng có KH_id (đã đăng ký thành viên).
   *  - 'guest': khách hàng không có KH_id (mua hàng không đăng nhập).
   */
  async getOrderStatsByCustomerType(
    from: Date,
    to: Date
  ): Promise<Record<'member' | 'guest', number>> {
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    const raw = await this.DonHangModel.aggregate([
      {
        $match: {
          DH_ngayCapNhat: { $gte: from, $lte: to },
          DH_trangThai: { $in: ['GiaoThanhCong', 'GiaoThatBai'] },
        },
      },
      {
        $project: {
          type: {
            $cond: {
              if: { $ifNull: ['$KH_id', false] },
              then: 'member',
              else: 'guest',
            },
          },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
        },
      },
    ]);
    const result: Record<'member' | 'guest', number> = {
      member: 0,
      guest: 0,
    };
    for (const item of raw) {
      const type = item._id as 'member' | 'guest';
      result[type] = item.total;
    }
    return result;
  }

  /**
   * Truy vấn danh sách mã đơn hàng (DH_id) được tạo trong khoảng thời gian chỉ định.
   *
   * @param from - Ngày bắt đầu của khoảng thời gian (sẽ được đặt về đầu ngày: 00:00:00).
   * @param to - Ngày kết thúc của khoảng thời gian (sẽ được đặt về cuối ngày: 23:59:59).
   * @returns Mảng chuỗi gồm các mã đơn hàng (DH_id) thỏa điều kiện thời gian.
   */
  async getOrderIdsByDate(from: Date, to: Date): Promise<string[]> {
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    const raw = await this.DonHangModel.aggregate([
      {
        $match: {
          DH_ngayCapNhat: { $gte: from, $lte: to },
        },
      },
      {
        $project: {
          _id: 0,
          DH_id: 1,
        },
      },
    ]);
    return raw.map((item: { DH_id: string }) => item.DH_id);
  }
}
