import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NHAN_VIEN, NHAN_VIENDocument } from './staffs.schema';

@Injectable()
export class StaffsRepository {
  constructor(
    @InjectModel(NHAN_VIEN.name)
    private readonly Staff: Model<NHAN_VIENDocument>
  ) {}

  async create(createNhanVienDto: any): Promise<NHAN_VIEN> {
    const createdNhanVien = new this.Staff(createNhanVienDto);
    return await createdNhanVien.save();
  }

  async findLastCode(): Promise<string> {
    const result = await this.Staff.find({})
      .sort({ NV_id: -1 })
      .limit(1)
      .select('NV_id')
      .lean();

    if (result.length === 0) {
      return '0000000';
    }

    const lastCode = result[0].NV_id;
    return lastCode;
  }

  async findAll(): Promise<NHAN_VIEN[]> {
    return this.Staff.find({ NV_daXoa: false }).exec();
  }

  async findByCode(code: string): Promise<NHAN_VIEN | null> {
    return this.Staff.findOne({ NV_id: code, NV_daXoa: false }).exec();
  }

  async update(id: string, updateNhanVienDto: any): Promise<NHAN_VIEN | null> {
    return this.Staff.findByIdAndUpdate({ NV_id: id }, updateNhanVienDto, {
      new: true,
    }).exec();
  }

  async delete(id: string): Promise<NHAN_VIEN | null> {
    return this.Staff.findByIdAndUpdate(
      { NV_id: id },
      { NV_daXoa: true },
      { new: true }
    ).exec();
  }

  async countAll(): Promise<number> {
    return this.Staff.countDocuments().exec();
  }
}
