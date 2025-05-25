import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PhiVanChuyen, PhiVanChuyenDocument } from './shippingFee.schema';

@Injectable()
export class ShippingFeeRepository {
  constructor(
    @InjectModel(PhiVanChuyen.name)
    private readonly ShippingFee: Model<PhiVanChuyenDocument>
  ) {}

  async create(newShippingFee: any): Promise<PhiVanChuyen> {
    const created = new this.ShippingFee(newShippingFee);
    return created.save();
  }

  async findAll(): Promise<PhiVanChuyen[]> {
    return this.ShippingFee.find({ VC_daXoa: false }).exec();
  }

  async findById(id: number): Promise<PhiVanChuyen | null> {
    return this.ShippingFee.findOne({ T_id: id }).exec();
  }

  async update(id: string, data: any): Promise<PhiVanChuyen | null> {
    return this.ShippingFee.findOneAndUpdate({ T_id: id }, data, {
      new: true,
    }).exec();
  }

  async delete(id: string): Promise<PhiVanChuyen | null> {
    return this.ShippingFee.findOneAndUpdate(
      { T_id: id },
      { VC_daXoa: true },
      { new: true }
    ).exec();
  }
  async countAll(): Promise<number> {
    return this.ShippingFee.countDocuments({ VC_daXoa: false }).exec();
  }
}
