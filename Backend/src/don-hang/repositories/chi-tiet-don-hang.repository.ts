import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';

import {
  ChiTietDonHang,
  ChiTietDonHangDocument,
} from '../schemas/chi-tiet-don-hang.schema';

@Injectable()
export class ChiTietDonHangRepository {
  constructor(
    @InjectModel(ChiTietDonHang.name)
    private readonly ChiTietDonHangModel: Model<ChiTietDonHangDocument>
  ) {}

  /**
   * Tạo mới các chi tiết đơn hàng cho một đơn hàng cụ thể.
   * @param orderId - Mã đơn hàng liên kết với các chi tiết.
   * @param detail - Danh sách các chi tiết đơn hàng.
   * @param session - Phiên giao dịch MongoDB (nếu có).
   * @returns Promise chứa danh sách chi tiết đơn hàng đã được tạo.
   */
  async create(
    orderId: string,
    detail: Partial<ChiTietDonHang>[],
    session?: ClientSession
  ) {
    const data = detail.map((ct) => ({
      DH_id: orderId,
      ...ct,
    }));
    return this.ChiTietDonHangModel.insertMany(data, { session });
  }

  /**
   * Tìm tất cả chi tiết đơn hàng theo ID đơn hàng.
   * @param orderId - Mã đơn hàng.
   * @returns Danh sách chi tiết đơn hàng dưới dạng plain object.
   */
  async findByOrderId(orderId: string) {
    return this.ChiTietDonHangModel.find({ DH_id: orderId }).lean();
  }

  /**
   * Tính toán thống kê chi tiết sản phẩm cho danh sách đơn hàng.
   * @param orderIds - Mảng mã đơn hàng.
   * @returns Tổng giá bán, giá nhập, giá mua và số lượng sản phẩm.
   */
  async getOrderDetailsStats(orderIds: string[]): Promise<{
    totalSalePrice: number;
    totalCostPrice: number;
    totalBuyPrice: number;
    totalQuantity: number;
  }> {
    const raw: {
      totalSalePrice: number;
      totalCostPrice: number;
      totalBuyPrice: number;
      totalQuantity: number;
    }[] = await this.ChiTietDonHangModel.aggregate([
      {
        $match: {
          DH_id: { $in: orderIds },
        },
      },
      {
        $group: {
          _id: null,
          totalSalePrice: {
            $sum: { $multiply: ['$CTDH_giaBan', '$CTDH_soLuong'] },
          },
          totalCostPrice: {
            $sum: { $multiply: ['$CTDH_giaNhap', '$CTDH_soLuong'] },
          },
          totalBuyPrice: {
            $sum: { $multiply: ['$CTDH_giaMua', '$CTDH_soLuong'] },
          },
          totalQuantity: { $sum: '$CTDH_soLuong' },
        },
      },
    ]);
    return (
      raw[0] ?? {
        totalSalePrice: 0,
        totalCostPrice: 0,
        totalBuyPrice: 0,
        totalQuantity: 0,
      }
    );
  }

  /**
   * Thống kê số lượng sản phẩm đã giảm giá và tổng số lượng sản phẩm trong đơn hàng.
   * @param orderId - Mảng mã đơn hàng cần thống kê.
   * @returns Tổng số sản phẩm và số sản phẩm có giá mua thấp hơn giá bán.
   */
  async getDiscountedProductStats(orderId: string[]): Promise<{
    totalProducts: number;
    discountedProducts: number;
  }> {
    const raw: {
      totalProducts: number;
      discountedProducts: number;
    }[] = await this.ChiTietDonHangModel.aggregate([
      {
        $match: {
          DH_id: { $in: orderId },
        },
      },
      {
        $facet: {
          total: [
            {
              $group: {
                _id: null,
                totalProducts: { $sum: '$CTDH_soLuong' },
              },
            },
          ],
          discounted: [
            {
              $match: {
                $expr: { $lt: ['$CTDH_giaMua', '$CTDH_giaBan'] },
              },
            },
            {
              $group: {
                _id: null,
                discountedProducts: { $sum: '$CTDH_soLuong' },
              },
            },
          ],
        },
      },
      {
        $project: {
          totalProducts: {
            $ifNull: [{ $arrayElemAt: ['$total.totalProducts', 0] }, 0],
          },
          discountedProducts: {
            $ifNull: [
              { $arrayElemAt: ['$discounted.discountedProducts', 0] },
              0,
            ],
          },
        },
      },
    ]);
    return (
      raw[0] || {
        totalProducts: 0,
        discountedProducts: 0,
      }
    );
  }
}
