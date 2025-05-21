import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PHI_VAN_CHUYEN, PHI_VAN_CHUYENDocument } from './shippingFee.schema';

@Injectable()
export class ShippingFeeRepository {
  constructor(
    @InjectModel(PHI_VAN_CHUYEN.name)
    private readonly ShippingFee: Model<PHI_VAN_CHUYENDocument>
  ) {}

  async create(newShippingFee: any): Promise<PHI_VAN_CHUYEN> {
    const created = new this.ShippingFee(newShippingFee);
    return created.save();
  }

  async findAll(): Promise<PHI_VAN_CHUYEN[]> {
    return this.ShippingFee.find({ VC_daXoa: false }).exec();
  }

  async findById(id: string): Promise<PHI_VAN_CHUYEN | null> {
    return this.ShippingFee.findOne({ VC_id: id }).exec();
  }

  async findByProvince(id: number): Promise<PHI_VAN_CHUYEN | null> {
    return this.ShippingFee.findOne({ T_id: id }).exec();
  }

  async update(id: string, data: any): Promise<PHI_VAN_CHUYEN | null> {
    return this.ShippingFee.findOneAndUpdate({ VC_id: id }, data, {
      new: true,
    }).exec();
  }

  async delete(id: string): Promise<PHI_VAN_CHUYEN | null> {
    return this.ShippingFee.findOneAndUpdate(
      { VC_id: id },
      { VC_daXoa: true },
      { new: true }
    ).exec();
  }
  async countAll(): Promise<number> {
    return this.ShippingFee.countDocuments({ VC_daXoa: false }).exec();
  }

  async findLastId(): Promise<number> {
    const result = await this.ShippingFee.findOne()
      .sort({ VC_id: -1 })
      .select('VC_id')
      .lean();
    return result ? result.VC_id : 0;
  }
}
