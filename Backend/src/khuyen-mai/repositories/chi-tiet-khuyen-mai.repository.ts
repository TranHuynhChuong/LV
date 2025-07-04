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
          SP_id: { $in: SPIds },
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
          SP_id: 1,
          CTKM_theoTyLe: 1,
          CTKM_giaTri: 1,
          CTKM_tamNgung: 1,
        },
      },
    ]);
  }

  async findAllByKMid(KM_id: string): Promise<ChiTietKhuyenMai[]> {
    return this.ChiTietKhuyenMaiModel.find({ KM_id, CTKM_daXoa: false })
      .lean()
      .exec();
  }

  async create(data: Partial<ChiTietKhuyenMai>[], session?: ClientSession) {
    return this.ChiTietKhuyenMaiModel.insertMany(data, { session });
  }

  async update(
    SP_id: number,
    KM_id: string,
    update: Partial<ChiTietKhuyenMai>,
    session?: ClientSession
  ) {
    return this.ChiTietKhuyenMaiModel.findOneAndUpdate(
      { SP_id, KM_id, CTKM_daXoa: false },
      update,
      { new: true, session }
    );
  }

  async delete(KM_id: string, SP_id: number, session?: ClientSession) {
    return this.ChiTietKhuyenMaiModel.updateOne(
      { KM_id, SP_id },
      { CTKM_daXoa: true },
      { session }
    );
  }
}
