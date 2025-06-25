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
}
