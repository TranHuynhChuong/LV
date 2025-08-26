import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { NhanVien, NhanVienDocument } from '../schemas/nhan-vien.schema';

@Injectable()
export class NhanVienRepository {
  constructor(
    @InjectModel(NhanVien.name)
    private readonly NhanVienModel: Model<NhanVienDocument>
  ) {}

  async create(createDto: any, session?: ClientSession): Promise<NhanVien> {
    const created = new this.NhanVienModel(createDto);
    return created.save({ session });
  }

  async findAll(): Promise<NhanVien[]> {
    return this.NhanVienModel.find()
      .select('NV_id NV_vaiTro NV_hoTen NV_email NV_soDienThoai NV_daKhoa')
      .lean()
      .exec();
  }

  async findById(id: string): Promise<NhanVien | null> {
    return this.NhanVienModel.findOne({ NV_id: id }).lean().exec();
  }

  async findUnBlockById(id: string): Promise<NhanVien | null> {
    return this.NhanVienModel.findOne({ NV_id: id, NV_daKhoa: false })
      .lean()
      .exec();
  }

  async findAllIds(ids: string[]): Promise<NhanVien[]> {
    return this.NhanVienModel.find({ NV_id: { $in: ids } })
      .lean()
      .exec();
  }

  async update(
    id: string,
    data: any,
    session?: ClientSession
  ): Promise<NhanVien | null> {
    return this.NhanVienModel.findOneAndUpdate({ NV_id: id }, data, {
      new: true,
      session,
    }).exec();
  }

  async countAll(): Promise<number> {
    return this.NhanVienModel.countDocuments().exec();
  }
}
