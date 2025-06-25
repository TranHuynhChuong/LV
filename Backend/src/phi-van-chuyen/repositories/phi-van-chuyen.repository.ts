import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import {
  PhiVanChuyen,
  PhiVanChuyenDocument,
} from '../schemas/phi-van-chuyen.schema';

@Injectable()
export class PhiVanChuyenRepository {
  constructor(
    @InjectModel(PhiVanChuyen.name)
    private readonly PhiVanChuyenModel: Model<PhiVanChuyenDocument>
  ) {}

  async create(data: any, session?: ClientSession): Promise<PhiVanChuyen> {
    const created = new this.PhiVanChuyenModel(data);
    return created.save({ session });
  }

  async findLastId(session?: ClientSession): Promise<number> {
    const result = await this.PhiVanChuyenModel.find({})
      .sort({ PVC_id: -1 })
      .limit(1)
      .select('PVC_id')
      .session(session ?? null)
      .lean()
      .exec();

    return result.length > 0 ? result[0].PVC_id : 0;
  }

  async findAll(): Promise<Partial<PhiVanChuyen>[]> {
    return this.PhiVanChuyenModel.find({ PVC_daXoa: false })
      .select('PVC_phi PVC_ntl PVC_phuPhi PVC_dvpp T_id PVC_id')
      .lean()
      .exec();
  }

  async findByProvinceId(id: number): Promise<PhiVanChuyen | null> {
    return this.PhiVanChuyenModel.findOne({ T_id: id, PVC_daXoa: false })
      .select('-lichSuThaoTac')
      .lean()
      .exec();
  }

  async findById(id: number): Promise<PhiVanChuyen | null> {
    return this.PhiVanChuyenModel.findOne({ PVC_id: id, PVC_daXoa: false })
      .lean()
      .exec();
  }

  async update(id: number, data: any): Promise<PhiVanChuyen | null> {
    return this.PhiVanChuyenModel.findOneAndUpdate({ PVC_id: id }, data, {
      new: true,
    })

      .exec();
  }

  async delete(id: number): Promise<PhiVanChuyen | null> {
    return this.PhiVanChuyenModel.findOneAndUpdate(
      { PVC_id: id },
      { PVC_daXoa: true },
      { new: true }
    )

      .exec();
  }
  async countAll(): Promise<number> {
    return this.PhiVanChuyenModel.countDocuments({ PVC_daXoa: false }).exec();
  }
}
