import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { PhiVanChuyen, PhiVanChuyenDocument } from './phiVanChuyen.schema';

@Injectable()
export class PhiVanChuyenRepository {
  constructor(
    @InjectModel(PhiVanChuyen.name)
    private readonly model: Model<PhiVanChuyenDocument>
  ) {}

  async create(data: any, session?: ClientSession): Promise<PhiVanChuyen> {
    const created = new this.model(data);
    return created.save({ session });
  }

  async findLastId(session?: ClientSession): Promise<number> {
    const result = await this.model
      .find({})
      .sort({ PVC_id: -1 })
      .limit(1)
      .select('PVC_id')
      .session(session ?? null)
      .lean()
      .exec();

    return result.length > 0 ? result[0].PVC_id : 0;
  }

  async findAll(): Promise<Partial<PhiVanChuyen>[]> {
    return this.model
      .find({ PVC_daXoa: false })
      .select('PVC_phi PVC_ntl PVC_phuPhi PVC_dvpp T_id')
      .lean()
      .exec();
  }

  async findById(id: number): Promise<PhiVanChuyen | null> {
    return this.model.findOne({ T_id: id }).lean().exec();
  }

  async update(id: number, data: any): Promise<PhiVanChuyen | null> {
    return this.model
      .findOneAndUpdate({ T_id: id }, data, {
        new: true,
      })

      .exec();
  }

  async delete(id: number): Promise<PhiVanChuyen | null> {
    return this.model
      .findOneAndUpdate({ T_id: id }, { PVC_daXoa: true }, { new: true })

      .exec();
  }
  async countAll(): Promise<number> {
    return this.model.countDocuments({ PVC_daXoa: false }).exec();
  }
}
