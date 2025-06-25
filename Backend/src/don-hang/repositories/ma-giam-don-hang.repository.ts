import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';

import {
  MaGiamDonHang,
  MaGiamDonHangDocument,
} from '../schemas/ma-giam-don-hang.schema';

@Injectable()
export class MaGiamDonHangRepository {
  constructor(
    @InjectModel(MaGiamDonHang.name)
    private readonly maGiamModel: Model<MaGiamDonHangDocument>
  ) {}

  // Tạo mã giảm giá đơn hàng
  async create(dhId: string, mgIds: string[], session?: ClientSession) {
    const data = mgIds.map((mgId) => ({
      DH_id: dhId,
      MG_id: mgId,
    }));
    return this.maGiamModel.insertMany(data, { session });
  }
}
