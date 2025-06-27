import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, PipelineStage } from 'mongoose';

import {
  DonHang,
  DonHangDocument,
  TrangThaiDonHang,
} from '../schemas/don-hang.schema';
import { paginateRawAggregate } from 'src/Util/paginateWithFacet';

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

  // ======================== Tạo đơn hàng ==================== //
  // Tạo đơn hàng
  async create(data: Partial<DonHang>, session?: ClientSession) {
    return this.DonHangModel.create([{ ...data }], { session }).then(
      (res) => res[0]
    );
  }

  async findLastId(session: ClientSession): Promise<string | null> {
    const lastDonHang = await this.DonHangModel.findOne({}, {}, { session }) // truyền session ở đây
      .sort({ DH_id: -1 })
      .select('DH_id')
      .lean();

    return lastDonHang?.DH_id ?? null;
  }

  // ================================================================= //

  // ==========================Lấy đơn hàng=========================== //

  // => Lookup lấy thông tin đơn hàng, thông tin nhận hàng, chi tiết đơn hàng - thông tin sản phẩm - thông tin đã đánh giá hay chưa
  protected getOrderPipeline(filter?: Record<string, any>): PipelineStage[] {
    const pipeline: PipelineStage[] = [];

    if (filter && Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter });
    }

    pipeline.push(
      // B1: Join chi tiết đơn hàng
      {
        $lookup: {
          from: 'chitietdonhangs',
          localField: 'DH_id',
          foreignField: 'DH_id',
          as: 'chiTietDonHang',
        },
      },
      {
        $unwind: {
          path: '$chiTietDonHang',
          preserveNullAndEmptyArrays: true,
        },
      },

      // B2: Join sản phẩm
      {
        $lookup: {
          from: 'sanphams',
          localField: 'chiTietDonHang.SP_id',
          foreignField: 'SP_id',
          as: 'sanPham',
        },
      },
      {
        $unwind: {
          path: '$sanPham',
          preserveNullAndEmptyArrays: true,
        },
      },

      // 🔍 B3: Join thông tin nhận hàng từ ttnhanhangdhs
      {
        $lookup: {
          from: 'ttnhanhangdhs',
          localField: 'DH_id',
          foreignField: 'DH_id',
          as: 'nhanHang',
        },
      },
      {
        $unwind: {
          path: '$nhanHang',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'danhgias',
          let: {
            spId: '$chiTietDonHang.SP_id',
            dhId: '$DH_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$SP_id', '$$spId'] },
                    { $eq: ['$DH_id', '$$dhId'] },
                  ],
                },
              },
            },
            { $limit: 1 }, // chỉ cần biết có đánh giá hay không
          ],
          as: 'danhGia',
        },
      },
      {
        $addFields: {
          'chiTietDonHang.daDanhGia': {
            $cond: [{ $gt: [{ $size: '$danhGia' }, 0] }, true, false],
          },
        },
      },
      // B4: Gom nhóm đơn hàng và đính kèm thông tin
      {
        $group: {
          _id: '$_id',
          DH_id: { $first: '$DH_id' },
          DH_ngayTao: { $first: '$DH_ngayTao' },
          DH_trangThai: { $first: '$DH_trangThai' },
          DH_giamHD: { $first: '$DH_giamHD' },
          DH_giamVC: { $first: '$DH_giamVC' },
          DH_phiVC: { $first: '$DH_phiVC' },
          DH_HD: { $first: '$DH_HD' },
          KH_id: { $first: '$KH_id' },
          KH_email: { $first: '$KH_email' },
          lichSuThaoTac: { $first: '$lichSuThaoTac' },

          // thông tin nhận hàng
          thongTinNhanHang: {
            $first: {
              NH_hoTen: '$nhanHang.NH_hoTen',
              NH_soDienThoai: '$nhanHang.NH_soDienThoai',
              NH_diaChi: {
                T_id: '$nhanHang.T_id',
                X_id: '$nhanHang.X_id',
              },
              NH_ghiChu: '$nhanHang.NH_ghiChu',
            },
          },

          // chi tiết sản phẩm
          chiTietDonHang: {
            $push: {
              SP_id: '$chiTietDonHang.SP_id',
              CTDH_soLuong: '$chiTietDonHang.CTDH_soLuong',
              CTDH_giaMua: '$chiTietDonHang.CTDH_giaMua',
              CTDH_giaBan: '$chiTietDonHang.CTDH_giaBan',
              CTDH_giaNhap: '$chiTietDonHang.CTDH_giaNhap',
              SP_ten: '$sanPham.SP_ten',
              SP_anh: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: '$sanPham.SP_anh',
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
              SP_trangThai: '$sanPham.SP_trangThai',
              daDanhGia: '$chiTietDonHang.daDanhGia',
            },
          },
        },
      }
    );

    return pipeline;
  }

  protected getFilter(
    filterType?: OrderStatus,
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

    if (userId) {
      filter.KH_id = userId;
    }

    return filter;
  }

  async findAll(
    page: number,
    limit: number = 24,
    filterType?: OrderStatus,
    userId?: number
  ) {
    const filter = this.getFilter(filterType, userId);
    const pipeline = [...this.getOrderPipeline(filter)];

    const countPipeline = [...pipeline, { $count: 'count' }];
    const dataPipeline: PipelineStage[] = [...pipeline];
    const skip = (page - 1) * limit;
    dataPipeline.push({ $sort: { DH_ngayTao: -1 } });
    dataPipeline.push({ $skip: skip }, { $limit: limit });

    return paginateRawAggregate({
      model: this.DonHangModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  async findById(orderId: string, filterType?: OrderStatus): Promise<any> {
    const filter = this.getFilter(filterType);
    const pipeline: PipelineStage[] = [
      { $match: { DH_id: orderId } },
      ...this.getOrderPipeline(filter),
    ];

    const result = await this.DonHangModel.aggregate(pipeline).exec();
    return result && result.length > 0 ? result[0] : null;
  }

  async getById(id: string): Promise<DonHang | null> {
    return this.DonHangModel.findOne({ DH_id: id }).exec();
  }
  // ================================================================= //
  // ============================Cập nhật============================= //

  async update(
    DH_id: string,
    status: OrderStatus,
    activityLog?: any
  ): Promise<DonHang | null> {
    const updateQuery: any = {
      DH_trangThai: OrderStatusMap[status],
    };

    const updateOps: any = {
      $set: updateQuery,
    };

    if (activityLog) {
      updateOps.$push = {
        lichSuThaoTac: activityLog,
      };
    }

    return this.DonHangModel.findOneAndUpdate({ DH_id }, updateOps, {
      new: true,
    });
  }

  async countAll(): Promise<{
    total: number;
    pending: number;
    toShip: number;
    shipping: number;
    complete: number;
    inComplete: number;
    cancelRequest: number;
    canceled: number;
  }> {
    const [
      total,
      pending,
      toShip,
      shipping,
      complete,
      inComplete,
      cancelRequest,
      canceled,
    ] = await Promise.all([
      this.DonHangModel.countDocuments(),
      this.DonHangModel.countDocuments({
        DH_trangThai: TrangThaiDonHang.ChoXacNhan,
      }),
      this.DonHangModel.countDocuments({
        DH_trangThai: TrangThaiDonHang.ChoVanChuyen,
      }),
      this.DonHangModel.countDocuments({
        DH_trangThai: TrangThaiDonHang.DangVanChuyen,
      }),
      this.DonHangModel.countDocuments({
        DH_trangThai: TrangThaiDonHang.GiaoThanhCong,
      }),
      this.DonHangModel.countDocuments({
        DH_trangThai: TrangThaiDonHang.GiaoThatBai,
      }),
      this.DonHangModel.countDocuments({
        DH_trangThai: TrangThaiDonHang.YeuCauHuy,
      }),
      this.DonHangModel.countDocuments({
        DH_trangThai: TrangThaiDonHang.DaHuy,
      }),
    ]);

    return {
      total,
      pending,
      toShip,
      shipping,
      complete,
      inComplete,
      cancelRequest,
      canceled,
    };
  }

  //============ Thống kê ==============//

  async getOrderStatsByStatus(startDate: Date, endDate: Date) {
    const raw = await this.DonHangModel.aggregate([
      {
        $match: {
          DH_ngayTao: { $gte: startDate, $lte: endDate },
          DH_trangThai: { $in: ['GiaoThanhCong', 'GiaoThatBai', 'DaHuy'] },
        },
      },
      {
        $group: {
          _id: '$DH_trangThai',
          count: { $sum: 1 },
          orderIds: { $push: '$DH_id' }, // thu thập DH_id
        },
      },
    ]);

    const statusMap: Record<string, string> = {
      GiaoThanhCong: 'complete',
      GiaoThatBai: 'inComplete',
      DaHuy: 'canceled',
    };

    const result: Record<string, { total: number; orderIds: string[] }> = {
      complete: { total: 0, orderIds: [] },
      inComplete: { total: 0, orderIds: [] },
      canceled: { total: 0, orderIds: [] },
    };

    for (const item of raw) {
      const status = statusMap[item._id] || item._id;
      result[status] = {
        total: item.total,
        orderIds: item.orderIds,
      };
    }

    return result;
  }

  async getOrderStatsByCustomerType(startDate: Date, endDate: Date) {
    const raw = await this.DonHangModel.aggregate([
      {
        $match: {
          DH_ngayTao: { $gte: startDate, $lte: endDate },
          DH_trangThai: 'GiaoThanhCong',
        },
      },
      {
        $project: {
          DH_id: 1,
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
          orderIds: { $push: '$DH_id' },
        },
      },
    ]);

    const result: Record<string, { total: number; orderIds: string[] }> = {
      member: { total: 0, orderIds: [] },
      guest: { total: 0, orderIds: [] },
    };

    for (const item of raw) {
      result[item._id] = {
        total: item.total,
        orderIds: item.orderIds,
      };
    }

    return result;
  }
}
