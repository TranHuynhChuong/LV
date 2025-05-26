import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NhanVien, NhanVienDocument } from './nhanVien.schema';

@Injectable()
export class NhanVienRepository {
  constructor(
    @InjectModel(NhanVien.name)
    private readonly NhanVien: Model<NhanVienDocument>
  ) {}

  async create(createDto: any): Promise<NhanVien> {
    const created = new this.NhanVien(createDto);
    return await created.save();
  }

  async findLastId(): Promise<string> {
    const result = await this.NhanVien.find({})
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
    return this.NhanVien.find({ NV_daXoa: false })
      .select('NV_id NV_hoTen NV_email NV_soDienThoai')
      .lean()
      .exec();
  }

  async findById(id: string): Promise<NhanVien | null> {
    return this.NhanVien.findOne({ NV_id: id, NV_daXoa: false }).lean().exec();
  }

  async update(id: string, updateDto: any): Promise<NhanVien | null> {
    return this.NhanVien.findOneAndUpdate({ NV_id: id }, updateDto, {
      new: true,
    })

      .exec();
  }

  async delete(id: string): Promise<NhanVien | null> {
    return this.NhanVien.findOneAndUpdate(
      { NV_id: id },
      { NV_daXoa: true },
      { new: true }
    ).exec();
  }

  async countAll(): Promise<number> {
    return this.NhanVien.countDocuments({ NV_daXoa: false }).exec();
  }
}
