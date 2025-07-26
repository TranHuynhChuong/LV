import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import {
  ChiTietKhuyenMai,
  ChiTietKhuyenMaiDocument,
} from '../schemas/chi-tiet-khuyen-mai.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChiTietKhuyenMaiRepository {
  constructor(
    @InjectModel(ChiTietKhuyenMai.name)
    private readonly ChiTietKhuyenMaiModel: Model<ChiTietKhuyenMaiDocument>
  ) {}

  async findValidByProductIds(SPIds: number[]) {
    const now = new Date();

    return this.ChiTietKhuyenMaiModel.aggregate([
      {
        $match: {
          S_id: { $in: SPIds },
          CTKM_daXoa: false,
          CTKM_tamNgung: false,
        },
      },
      {
        $lookup: {
          from: 'khuyenmais',
          localField: 'KM_id',
          foreignField: 'KM_id',
          as: 'khuyenMai',
        },
      },
      { $unwind: '$khuyenMai' },
      {
        $match: {
          'khuyenMai.KM_batDau': { $lte: now },
          'khuyenMai.KM_ketThuc': { $gte: now },
        },
      },
      {
        $project: {
          KM_id: 1,
          S_id: 1,
          CTKM_theoTyLe: 1,
          CTKM_giaTri: 1,
          CTKM_tamNgung: 1,
        },
      },
    ]);
  }

  async findAllByKMid(KM_id: number): Promise<ChiTietKhuyenMai[]> {
    return this.ChiTietKhuyenMaiModel.find({ KM_id, CTKM_daXoa: false })
      .lean()
      .exec();
  }

  async create(data: Partial<ChiTietKhuyenMai>[], session?: ClientSession) {
    return this.ChiTietKhuyenMaiModel.insertMany(data, { session });
  }

  async update(
    S_id: number,
    KM_id: number,
    update: Partial<ChiTietKhuyenMai>,
    session?: ClientSession
  ) {
    return this.ChiTietKhuyenMaiModel.findOneAndUpdate(
      { S_id, KM_id, CTKM_daXoa: false },
      update,
      { new: true, session }
    );
  }

  async remove(KM_id: number, S_id: number, session?: ClientSession) {
    return this.ChiTietKhuyenMaiModel.updateOne(
      { KM_id, S_id },
      { CTKM_daXoa: true },
      { session }
    );
  }

  async delete(KM_id: number, session?: ClientSession) {
    return this.ChiTietKhuyenMaiModel.deleteOne({ KM_id }, { session });
  }
}
