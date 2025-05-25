import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PhiVanChuyen, PhiVanChuyenDocument } from './phiVanChuyen.schema';

@Injectable()
export class PhiVanChuyenRepository {
  constructor(
    @InjectModel(PhiVanChuyen.name)
    private readonly PhiVanChuyen: Model<PhiVanChuyenDocument>
  ) {}

  async create(data: any): Promise<PhiVanChuyen> {
    const created = new this.PhiVanChuyen(data);
    return created.save();
  }

  async findAll(): Promise<PhiVanChuyen[]> {
    return this.PhiVanChuyen.find({ PVC_daXoa: false }).lean().exec();
  }

  async findAllBasic(): Promise<Partial<PhiVanChuyen>[]> {
    return this.PhiVanChuyen.find({ PVC_daXoa: false })
      .select('PVC_phi PVC_ntl PVC_phuPhi PVC_dvpp T_id')
      .lean()
      .exec();
  }

  async findById(id: number): Promise<PhiVanChuyen | null> {
    return this.PhiVanChuyen.findOne({ T_id: id }).lean().exec();
  }

  async update(id: string, data: any): Promise<PhiVanChuyen | null> {
    return this.PhiVanChuyen.findOneAndUpdate({ T_id: id }, data, {
      new: true,
    })

      .exec();
  }

  async delete(id: string): Promise<PhiVanChuyen | null> {
    return this.PhiVanChuyen.findOneAndUpdate(
      { T_id: id },
      { PVC_daXoa: true },
      { new: true }
    )

      .exec();
  }
  async countAll(): Promise<number> {
    return this.PhiVanChuyen.countDocuments({ PVC_daXoa: false }).exec();
  }
}
