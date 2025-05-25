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
    return this.PhiVanChuyen.find({ VC_daXoa: false }).exec();
  }

  async findById(id: number): Promise<PhiVanChuyen | null> {
    return this.PhiVanChuyen.findOne({ T_id: id }).exec();
  }

  async update(id: string, data: any): Promise<PhiVanChuyen | null> {
    return this.PhiVanChuyen.findOneAndUpdate({ T_id: id }, data, {
      new: true,
    }).exec();
  }

  async delete(id: string): Promise<PhiVanChuyen | null> {
    return this.PhiVanChuyen.findOneAndUpdate(
      { T_id: id },
      { VC_daXoa: true },
      { new: true }
    ).exec();
  }
  async countAll(): Promise<number> {
    return this.PhiVanChuyen.countDocuments({ VC_daXoa: false }).exec();
  }
}
