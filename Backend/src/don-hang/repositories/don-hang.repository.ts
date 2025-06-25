import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, PipelineStage } from 'mongoose';

import {
  DonHang,
  DonHangDocument,
  OrderStatus,
} from '../schemas/don-hang.schema';
import { paginateRawAggregate } from 'src/Util/paginateWithFacet';

export enum OrderFilterType {
  All = 'All',
  Pendding = 'Pendding', // Chờ xác nhận
  Toship = 'Toship', // Chờ vận chuyển (Đã xác nhận)
  Shipping = 'Shipping', // Đang vận chuyển (Đã xác nhận vận chuyển)
  Complete = 'Complete', // Đã giao hàng thành công
  InComplete = 'InComplete', // Đã giao hàng không thành công
  CancelRequest = 'CancelRequest', // Yêu cầu hủy hàng
  Canceled = 'Canceled', // Đã xác nhận hủy
}

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
          lichSuThaoTac: { $first: '$DH_lichSuThaoTac' },

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
    filterType?: OrderFilterType,
    userId?: number
  ): Record<string, any> {
    const filter: Record<string, any> = {};

    if (filterType !== OrderFilterType.All) {
      filter.DH_trangThai = filterType;
    }

    if (userId) {
      filter.KH_id = userId;
    }

    return filter;
  }

  async findAll(
    page: number,
    limit: number = 24,
    filterType?: OrderFilterType,
    userId?: number
  ) {
    const filter = this.getFilter(filterType, userId);
    const pipeline = [...this.getOrderPipeline(filter)];

    const countPipeline = [...pipeline, { $count: 'count' }];
    const dataPipeline: PipelineStage[] = [...pipeline];
    const skip = (page - 1) * limit;
    dataPipeline.push({ $skip: skip }, { $limit: limit });

    return paginateRawAggregate({
      model: this.DonHangModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  async findById(orderId: string, filterType?: OrderFilterType): Promise<any> {
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
      DH_trangThai: status,
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
    toship: number;
    shipping: number;
    complete: number;
    cancelrequest: number;
  }> {
    const [total, pending, toship, shipping, complete, cancelrequest] =
      await Promise.all([
        this.DonHangModel.countDocuments(),
        this.DonHangModel.countDocuments({
          DH_trangThai: OrderStatus.Pendding,
        }),
        this.DonHangModel.countDocuments({
          DH_trangThai: OrderStatus.ToShip,
        }),
        this.DonHangModel.countDocuments({
          DH_trangThai: OrderStatus.Shipping,
        }),
        this.DonHangModel.countDocuments({
          DH_trangThai: { $in: [OrderStatus.Complete, OrderStatus.InComplete] },
        }),
        this.DonHangModel.countDocuments({
          DH_trangThai: OrderStatus.CancelRequest,
        }),
      ]);

    return {
      total,
      pending,
      toship,
      shipping,
      complete,
      cancelrequest,
    };
  }
}
