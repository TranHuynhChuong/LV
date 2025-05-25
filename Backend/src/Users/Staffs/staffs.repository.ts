import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NhanVien, NhanVienDocument } from './staffs.schema';

@Injectable()
export class StaffsRepository {
  constructor(
    @InjectModel(NhanVien.name)
    private readonly Staff: Model<NhanVienDocument>
  ) {}

  async create(createNhanVienDto: any): Promise<NhanVien> {
    const createdNhanVien = new this.Staff(createNhanVienDto);
    return await createdNhanVien.save();
  }

  async findLastId(): Promise<string> {
    const result = await this.Staff.find({})
      .sort({ NV_id: -1 })
      .limit(1)
      .select('NV_id')
      .lean();

    if (result.length === 0) {
      return '0000000';
    }

    const lastId = result[0].NV_id;
    return lastId;
  }

  async findAll(): Promise<NhanVien[]> {
    return this.Staff.find({ NV_daXoa: false }).exec();
  }

  async findById(id: string): Promise<NhanVien | null> {
    return this.Staff.findOne({ NV_id: id, NV_daXoa: false }).exec();
  }

  async update(id: string, updateNhanVienDto: any): Promise<NhanVien | null> {
    return this.Staff.findOneAndUpdate({ NV_id: id }, updateNhanVienDto, {
      new: true,
    }).exec();
  }

  async delete(id: string): Promise<NhanVien | null> {
    return this.Staff.findOneAndUpdate(
      { NV_id: id },
      { NV_daXoa: true },
      { new: true }
    ).exec();
  }

  async countAll(): Promise<number> {
    return this.Staff.countDocuments({ NV_daXoa: false }).exec();
  }
}
