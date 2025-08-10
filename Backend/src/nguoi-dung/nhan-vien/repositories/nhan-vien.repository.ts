import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { NhanVien, NhanVienDocument } from '../schemas/nhan-vien.schema';

@Injectable()
export class NhanVienRepository {
  constructor(
    @InjectModel(NhanVien.name)
    private readonly model: Model<NhanVienDocument>
  ) {}

  async create(createDto: any, session?: ClientSession): Promise<NhanVien> {
    const created = new this.model(createDto);
    return created.save({ session });
  }

  async findAll(): Promise<NhanVien[]> {
    return this.model
      .find()
      .select('NV_id NV_vaiTro NV_hoTen NV_email NV_soDienThoai NV_daKhoa')
      .lean()
      .exec();
  }

  async findById(id: string): Promise<NhanVien | null> {
    return this.model.findOne({ NV_id: id }).lean().exec();
  }

  async findUnBlockById(id: string): Promise<NhanVien | null> {
    return this.model.findOne({ NV_id: id, NV_daKhoa: false }).lean().exec();
  }

  async findAllIds(ids: string[]): Promise<NhanVien[]> {
    return this.model
      .find({ NV_id: { $in: ids } })
      .lean()
      .exec();
  }

  async update(id: string, data: any): Promise<NhanVien | null> {
    return this.model
      .findOneAndUpdate({ NV_id: id }, data, {
        new: true,
      })
      .exec();
  }

  async countAll(): Promise<number> {
    return this.model.countDocuments().exec();
  }
}
