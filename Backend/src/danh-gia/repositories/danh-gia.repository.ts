import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, PipelineStage } from 'mongoose';
import { DanhGia, DanhGiaDocument } from '../schemas/danh-gia.schema';

import {
  PaginateResult,
  paginateRawAggregate,
} from 'src/Util/paginateWithFacet';

// Kết quả trả về khi truy vấn danh sách đánh giá
export type DanhGiaListResults = PaginateResult<DanhGiaDocument> & {
  rating?: {
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
  };
};

@Injectable()
export class DanhGiaRepository {
  constructor(
    @InjectModel(DanhGia.name)
    private readonly DanhGiaModel: Model<DanhGiaDocument>
  ) {}

  /**
   * Tạo mới một đánh giá
   *
   * @param data Dữ liệu đánh giá cần tạo
   * @param session Phiên giao dịch MongoDB (tùy chọn)
   */
  async create(
    data: Partial<DanhGia>,
    session?: ClientSession
  ): Promise<DanhGia> {
    const created = new this.DanhGiaModel(data);
    return created.save({ session });
  }

  /**
   * Tìm một đánh giá dựa trên mã đơn hàng, mã sách và mã khách hàng
   *
   * @param orderId Mã đơn hàng (DH_id)
   * @param bookId Mã sách (S_id)
   * @param customerId Mã khách hàng (KH_id)
   * @param session Phiên giao dịch MongoDB (tùy chọn)
   * @returns Đánh giá tương ứng
   */
  async findOne(
    orderId: string,
    bookId: number,
    customerId: number,
    session?: ClientSession
  ) {
    return this.DanhGiaModel.findOne({
      DH_id: orderId,
      S_id: bookId,
      KH_id: customerId,
    })
      .session(session ?? null)
      .lean();
  }

  /**
   * Lấy danh sách đánh giá có phân trang, kèm theo các bộ lọc nâng cao như điểm đánh giá, ngày tạo và trạng thái hiển thị.
   *
   * @param page Trang cần lấy đánh giá
   * @param limit Số lượng đánh giá trên mỗi trang (mặc định 24)
   * @param rating Điểm đánh giá cần lọc (tùy chọn)
   * @param from Ngày bắt đầu để lọc theo ngày tạo (tùy chọn)
   * @param to Ngày kết thúc để lọc theo ngày tạo (tùy chọn)
   * @param status Trạng thái hiển thị của đánh giá: 'all' (tất cả), 'visible' (hiển thị), 'hidden' (đã ẩn) (tùy chọn)
   * @returns Danh sách đánh giá phù hợp, có phân trang, kèm tổng số lượng
   */
  async findAll(
    page: number,
    limit = 24,
    rating?: number,
    from?: Date,
    to?: Date,
    status?: 'all' | 'visible' | 'hidden'
  ): Promise<DanhGiaListResults> {
    const skip = (page - 1) * limit;
    const matchConditions: any = {};
    // Lọc theo điểm đánh giá
    if (rating) {
      matchConditions.DG_diem = rating;
    }
    // Lọc theo ngày tạo
    if (from && to) {
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      matchConditions.DG_ngayTao = { $gte: from, $lte: to };
    }
    // Lọc theo trạng thái hiển thị
    if (status && status !== 'all') {
      matchConditions.DG_daAn = status === 'hidden';
    }
    const matchStage: PipelineStage.Match = { $match: matchConditions };
    const dataPipeline: PipelineStage[] = [
      matchStage,
      // Tham chiếu thông tin khách hàng
      {
        $lookup: {
          from: 'khachhangs',
          localField: 'KH_id',
          foreignField: 'KH_id',
          as: 'khachHang',
        },
      },
      { $unwind: { path: '$khachHang', preserveNullAndEmptyArrays: true } },
      // Tham chiếu thông tin sách
      {
        $lookup: {
          from: 'saches',
          localField: 'S_id',
          foreignField: 'S_id',
          as: 'sach',
        },
      },
      { $unwind: { path: '$sach', preserveNullAndEmptyArrays: true } },
      // Thêm trường thông tin phụ trợ
      {
        $addFields: {
          KH_hoTen: '$khachHang.KH_hoTen',
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
        },
      },
      {
        $project: {
          khachHang: 0,
          sach: 0,
        },
      },
      { $sort: { DG_ngayTao: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];
    const countPipeline: PipelineStage[] = [matchStage, { $count: 'count' }];
    return paginateRawAggregate({
      model: this.DanhGiaModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  /**
   * Lấy danh sách đánh giá của một quyển sách cụ thể
   *
   * @param bookId Mã sách cần lấy đánh giá
   * @param page Số trang hiện tại (bắt đầu từ 1)
   * @param limit Số lượng đánh giá trên mỗi trang (mặc định 24)
   * @returns Danh sách đánh giá, thông tin phân trang và tổng điểm đánh giá
   */
  async findAllOfBook(
    bookId: number,
    page: number,
    limit = 24
  ): Promise<DanhGiaListResults> {
    const skip = (page - 1) * limit;
    const matchStage: PipelineStage.Match = {
      $match: { S_id: bookId, DG_daAn: false },
    };
    const dataPipeline: PipelineStage[] = [
      matchStage,
      {
        $lookup: {
          from: 'khachhangs',
          localField: 'KH_id',
          foreignField: 'KH_id',
          as: 'khachHang',
        },
      },
      { $unwind: { path: '$khachHang', preserveNullAndEmptyArrays: true } },
      { $addFields: { KH_hoTen: '$khachHang.KH_hoTen' } },
      { $project: { khachHang: 0 } },
      { $sort: { DG_ngayTao: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];
    const countPipeline: PipelineStage[] = [matchStage, { $count: 'count' }];
    const result = await paginateRawAggregate({
      model: this.DanhGiaModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
    const rating = await this.countRatingOfBook(bookId);
    return {
      data: result.data as DanhGiaDocument[],
      rating,
      paginationInfo: result.paginationInfo,
    };
  }

  /**
   * Tính điểm đánh giá trung bình của một quyển sách (chỉ tính các đánh giá đang hiển thị).
   *
   * @param bookId Mã sách cần tính điểm trung bình
   * @param session Phiên giao dịch MongoDB (tùy chọn)
   * @returns Điểm trung bình đánh giá (0 nếu không có đánh giá nào)
   */
  async getAverageRatingOfBook(
    bookId: number,
    session?: ClientSession
  ): Promise<number> {
    type AvgRatingResult = { avgRating: number };
    const result = await this.DanhGiaModel.aggregate<AvgRatingResult>([
      { $match: { S_id: bookId, DG_daAn: false } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$DG_diem' },
        },
      },
    ]).session(session ?? null);
    return result[0]?.avgRating ?? 0;
  }

  /**
   * Thống kê số lượng đánh giá theo từng mức điểm (từ 1 đến 5 sao) của một quyển sách.
   *
   * @param bookId Mã sách cần thống kê đánh giá
   * @returns Một đối tượng chứa số lượng đánh giá ứng với từng điểm từ 1 đến 5.
   *
   * Ví dụ kết quả:
   * {
   *   s1: 2, // 2 lượt đánh giá 1 sao
   *   s2: 0,
   *   s3: 5,
   *   s4: 10,
   *   s5: 8
   * }
   */
  async countRatingOfBook(bookId: number): Promise<{
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
  }> {
    const [result] = await this.DanhGiaModel.aggregate<{
      s1: number;
      s2: number;
      s3: number;
      s4: number;
      s5: number;
    }>([
      {
        $match: {
          S_id: bookId,
          DG_daAn: false,
        },
      },
      {
        $group: {
          _id: null,
          s1: {
            $sum: {
              $cond: [{ $eq: ['$DG_diem', 1] }, 1, 0],
            },
          },
          s2: {
            $sum: {
              $cond: [{ $eq: ['$DG_diem', 2] }, 1, 0],
            },
          },
          s3: {
            $sum: {
              $cond: [{ $eq: ['$DG_diem', 3] }, 1, 0],
            },
          },
          s4: {
            $sum: {
              $cond: [{ $eq: ['$DG_diem', 4] }, 1, 0],
            },
          },
          s5: {
            $sum: {
              $cond: [{ $eq: ['$DG_diem', 5] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          s1: 1,
          s2: 1,
          s3: 1,
          s4: 1,
          s5: 1,
        },
      },
    ]);
    return (
      result ?? {
        s1: 0,
        s2: 0,
        s3: 0,
        s4: 0,
        s5: 0,
      }
    );
  }

  /**
   * Thống kê tổng hợp các đánh giá trong khoảng thời gian chỉ định.
   *
   * @param from Ngày bắt đầu thống kê.
   * @param to Ngày kết thúc thống kê.
   * @returns Một đối tượng thống kê tổng hợp theo cấu trúc:
   * ```ts
   * {
   *   s1: number,         // số đánh giá 1 sao
   *   s2: number,         // số đánh giá 2 sao
   *   s3: number,         // số đánh giá 3 sao
   *   s4: number,         // số đánh giá 4 sao
   *   s5: number,         // số đánh giá 5 sao
   *   totalOrders: number, // tổng số đơn hàng có đánh giá (không trùng)
   *   hidden: number,      // số đánh giá đang bị ẩn (DG_daAn = true)
   *   visible: number      // số đánh giá hiển thị (DG_daAn = false)
   * }
   * ```
   */
  async getRatingStats(
    from: Date,
    to: Date
  ): Promise<{
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
    totalOrders: number;
    hidden: number;
    visible: number;
  }> {
    const matchConditions: any = {};
    if (from && to) {
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      matchConditions.DG_ngayTao = { $gte: from, $lte: to };
    }
    const [result] = await this.DanhGiaModel.aggregate<{
      s1: number;
      s2: number;
      s3: number;
      s4: number;
      s5: number;
      totalOrders: number;
      hidden: number;
      visible: number;
    }>([
      {
        $match: matchConditions,
      },
      {
        $group: {
          _id: null,
          s1: { $sum: { $cond: [{ $eq: ['$DG_diem', 1] }, 1, 0] } },
          s2: { $sum: { $cond: [{ $eq: ['$DG_diem', 2] }, 1, 0] } },
          s3: { $sum: { $cond: [{ $eq: ['$DG_diem', 3] }, 1, 0] } },
          s4: { $sum: { $cond: [{ $eq: ['$DG_diem', 4] }, 1, 0] } },
          s5: { $sum: { $cond: [{ $eq: ['$DG_diem', 5] }, 1, 0] } },
          orderIds: { $addToSet: '$DH_id' },
          hidden: { $sum: { $cond: [{ $eq: ['$DG_daAn', true] }, 1, 0] } },
          visible: {
            $sum: { $cond: [{ $eq: ['$DG_daAn', false] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          s1: 1,
          s2: 1,
          s3: 1,
          s4: 1,
          s5: 1,
          hidden: 1,
          visible: 1,
          totalOrders: { $size: '$orderIds' },
        },
      },
    ]);
    return (
      result ?? {
        s1: 0,
        s2: 0,
        s3: 0,
        s4: 0,
        s5: 0,
        totalOrders: 0,
        hidden: 0,
        visible: 0,
      }
    );
  }

  /**
   * Thống kê tổng hợp các đánh giá theo danh sách đơn hàng.
   *
   * @param orderIds Danh sách ID đơn hàng cần thống kê.
   * @returns Một đối tượng thống kê tổng hợp theo cấu trúc:
   * ```ts
   * {
   *   s1: number,         // số đánh giá 1 sao
   *   s2: number,         // số đánh giá 2 sao
   *   s3: number,         // số đánh giá 3 sao
   *   s4: number,         // số đánh giá 4 sao
   *   s5: number,         // số đánh giá 5 sao
   *   totalOrders: number, // tổng số đơn hàng có đánh giá (không trùng)
   *   hidden: number,      // số đánh giá đang bị ẩn (DG_daAn = true)
   *   visible: number      // số đánh giá hiển thị (DG_daAn = false)
   * }
   * ```
   */
  async getRatingStatsByOrderIds(orderIds: string[]): Promise<{
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
    totalOrders: number;
    hidden: number;
    visible: number;
  }> {
    if (!orderIds || orderIds.length === 0) {
      return {
        s1: 0,
        s2: 0,
        s3: 0,
        s4: 0,
        s5: 0,
        totalOrders: 0,
        hidden: 0,
        visible: 0,
      };
    }

    const [result] = await this.DanhGiaModel.aggregate<{
      s1: number;
      s2: number;
      s3: number;
      s4: number;
      s5: number;
      totalOrders: number;
      hidden: number;
      visible: number;
    }>([
      {
        $match: {
          DH_id: { $in: orderIds },
        },
      },
      {
        $group: {
          _id: null,
          s1: { $sum: { $cond: [{ $eq: ['$DG_diem', 1] }, 1, 0] } },
          s2: { $sum: { $cond: [{ $eq: ['$DG_diem', 2] }, 1, 0] } },
          s3: { $sum: { $cond: [{ $eq: ['$DG_diem', 3] }, 1, 0] } },
          s4: { $sum: { $cond: [{ $eq: ['$DG_diem', 4] }, 1, 0] } },
          s5: { $sum: { $cond: [{ $eq: ['$DG_diem', 5] }, 1, 0] } },
          orderIds: { $addToSet: '$DH_id' },
          hidden: { $sum: { $cond: [{ $eq: ['$DG_daAn', true] }, 1, 0] } },
          visible: {
            $sum: { $cond: [{ $eq: ['$DG_daAn', false] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          s1: 1,
          s2: 1,
          s3: 1,
          s4: 1,
          s5: 1,
          hidden: 1,
          visible: 1,
          totalOrders: { $size: '$orderIds' },
        },
      },
    ]);
    return (
      result ?? {
        s1: 0,
        s2: 0,
        s3: 0,
        s4: 0,
        s5: 0,
        totalOrders: 0,
        hidden: 0,
        visible: 0,
      }
    );
  }

  /**
   * Cập nhật trạng thái ẩn/hiện của một đánh giá cụ thể và ghi lại lịch sử thao tác.
   *
   * Tìm đánh giá theo bộ ba khóa chính:
   * - Mã đơn hàng (`orderId`)
   * - Mã sách (`bookId`)
   * - Mã khách hàng (`customerId`)
   *
   * Cập nhật trạng thái hiển thị (`DG_daAn`) và thêm một bản ghi mới vào trường lịch sử thao tác (`lichSuThaoTac`).
   *
   * @param orderId Mã đơn hàng gắn với đánh giá.
   * @param bookId Mã sách được đánh giá.
   * @param customerId Mã khách hàng đã thực hiện đánh giá.
   * @param status Trạng thái ẩn/hiện của đánh giá (`true` nếu ẩn, `false` nếu hiển thị).
   * @param history Thông tin lịch sử thao tác cần ghi lại (bao gồm người thao tác, thời gian, hành động...).
   * @param session Phiên giao dịch MongoDB tùy chọn (sử dụng cho transaction).
   * @returns Đối tượng đánh giá sau khi được cập nhật, hoặc `null` nếu không tìm thấy đánh giá.
   */
  async update(
    orderId: string,
    bookId: number,
    customerId: number,
    status: boolean,
    history: any,
    session?: ClientSession
  ): Promise<DanhGia | null> {
    return this.DanhGiaModel.findOneAndUpdate(
      {
        DH_id: orderId,
        S_id: bookId,
        KH_id: customerId,
      },
      {
        $set: { DG_daAn: status },
        $push: { lichSuThaoTac: history },
      },
      {
        new: true,
        session,
      }
    );
  }
}
