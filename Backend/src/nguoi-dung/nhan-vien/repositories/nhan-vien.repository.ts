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

  async findLastId(session?: ClientSession): Promise<string> {
    const result = await this.model
      .find({})
      .sort({ NV_id: -1 })
      .limit(1)
      .select('NV_id')
      .session(session ?? null)
      .lean();

    return result.length > 0 ? result[0].NV_id : '0000000';
  }

  async findAll(): Promise<NhanVien[]> {
    return this.model
      .find({ NV_daXoa: false })
      .select('NV_id NV_vaiTro NV_hoTen NV_email NV_soDienThoai')
      .lean()
      .exec();
  }

  async findById(id: string): Promise<NhanVien | null> {
    return this.model.findOne({ NV_id: id, NV_daXoa: false }).lean().exec();
  }

  async findAllIds(ids: string[]): Promise<NhanVien[]> {
    return this.model
      .find({ NV_id: { $in: ids }, NV_daXoa: false })
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

  async delete(id: string): Promise<NhanVien | null> {
    return this.model
      .findOneAndUpdate({ NV_id: id }, { NV_daXoa: true }, { new: true })
      .exec();
  }

  async countAll(): Promise<number> {
    return this.model.countDocuments({ NV_daXoa: false }).exec();
  }
}
