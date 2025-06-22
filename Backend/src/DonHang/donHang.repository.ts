import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, PipelineStage } from 'mongoose';

import {
  DonHang,
  DonHangDocument,
  ChiTietDonHang,
  ChiTietDonHangDocument,
  MaGiamDonHang,
  MaGiamDonHangDocument,
} from './donHang.schema';
import { paginateRawAggregate } from 'src/Util/paginateWithFacet';

@Injectable()
export class DonHangRepository {
  constructor(
    @InjectModel(DonHang.name)
    private readonly donHangModel: Model<DonHangDocument>,
    @InjectModel(ChiTietDonHang.name)
    private readonly chiTietModel: Model<ChiTietDonHangDocument>,
    @InjectModel(MaGiamDonHang.name)
    private readonly maGiamModel: Model<MaGiamDonHangDocument>
  ) {}

  // ======================== Tạo đơn hàng ==================== //
  // Tạo đơn hàng
  async createDonHang(data: Partial<DonHang>, session?: ClientSession) {
    return this.donHangModel
      .create([{ ...data }], { session })
      .then((res) => res[0]);
  }

  // Tạo chi tiết đơn hàng
  async createChiTietDonHang(
    dhId: string,
    chiTiet: Partial<ChiTietDonHang>[],
    session?: ClientSession
  ) {
    const data = chiTiet.map((ct) => ({
      DH_id: dhId,
      ...ct,
    }));
    return this.chiTietModel.insertMany(data, { session });
  }

  // Tạo mã giảm giá đơn hàng
  async createMaGiamDonHang(
    dhId: string,
    mgIds: string[],
    session?: ClientSession
  ) {
    const data = mgIds.map((mgId) => ({
      DH_id: dhId,
      MG_id: mgId,
    }));
    return this.maGiamModel.insertMany(data, { session });
  }

  async findLastId(session: ClientSession): Promise<string | null> {
    const lastDonHang = await this.donHangModel
      .findOne({}, {}, { session }) // truyền session ở đây
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
    filterType: number = 0,
    userId?: number
  ): Record<string, any> {
    const filter: Record<string, any> = {};

    if (filterType !== 0) {
      filter.DH_trangThai = filterType;
    }

    if (userId) {
      filter.KH_id = userId;
    }

    return filter;
  }

  async getAllDonhang(
    page: number,
    limit: number = 24,
    filterType: number = 0,
    userId?: number
  ) {
    const filter = this.getFilter(filterType, userId);
    const pipeline = [...this.getOrderPipeline(filter)];

    const countPipeline = [...pipeline, { $count: 'count' }];
    const dataPipeline: PipelineStage[] = [...pipeline];
    const skip = (page - 1) * limit;
    dataPipeline.push({ $skip: skip }, { $limit: limit });

    return paginateRawAggregate({
      model: this.donHangModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  async getDetailDonhang(
    orderId: string,
    filterType: number = 0
  ): Promise<any> {
    const filter = this.getFilter(filterType);
    const pipeline: PipelineStage[] = [
      { $match: { DH_id: orderId } },
      ...this.getOrderPipeline(filter),
    ];

    const result = await this.donHangModel.aggregate(pipeline).exec();
    return result && result.length > 0 ? result[0] : null;
  }

  async getById(id: string): Promise<DonHang | null> {
    return this.donHangModel.findOne({ DH_id: id }).exec();
  }
  // ================================================================= //
  // ============================Cập nhật============================= //

  async updateTrangThai(
    DH_id: string,
    status: number,
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

    return this.donHangModel.findOneAndUpdate({ DH_id }, updateOps, {
      new: true,
    });
  }
}
