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

  // Tạo chi tiết đơn hàng
  async create(
    dhId: string,
    chiTiet: Partial<ChiTietDonHang>[],
    session?: ClientSession
  ) {
    const data = chiTiet.map((ct) => ({
      DH_id: dhId,
      ...ct,
    }));
    return this.ChiTietDonHangModel.insertMany(data, { session });
  }

  async findByOrderId(orderId: string) {
    return this.ChiTietDonHangModel.find({ DH_id: orderId }).lean();
  }

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

  async getDiscountedProductStats(dhIds: string[]): Promise<{
    totalProducts: number;
    discountedProducts: number;
  }> {
    const raw: {
      totalProducts: number;
      discountedProducts: number;
    }[] = await this.ChiTietDonHangModel.aggregate([
      {
        $match: {
          DH_id: { $in: dhIds },
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
