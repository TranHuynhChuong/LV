import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NHAN_VIEN, NHAN_VIENDocument } from './staff.schema';

@Injectable()
export class StaffRepository {
  constructor(
    @InjectModel(NHAN_VIEN.name)
    private readonly Staff: Model<NHAN_VIENDocument>
  ) {}

  async create(createNhanVienDto: any): Promise<NHAN_VIEN> {
    const createdNhanVien = new this.Staff(createNhanVienDto);
    return await createdNhanVien.save();
  }

  async findAll(): Promise<NHAN_VIEN[]> {
    return this.Staff.find({ NV_daXoa: false }) // Điều kiện NV_daXoa là false
      .populate({
        path: 'NV_nguoiThucHien',
        select: 'NV_hoTen',
      })
      .exec();
  }

  async findOneById(id: string): Promise<NHAN_VIEN | null> {
    return this.Staff.findOne({ _id: id, NV_daXoa: false }) // Điều kiện NV_daXoa là false
      .populate({
        path: 'NV_nguoiThucHien',
        select: 'NV_hoTen',
      })
      .exec();
  }

  async findByCode(code: string): Promise<NHAN_VIEN | null> {
    return this.Staff.findOne({ NV_ma: code, NV_daXoa: false }) // Điều kiện NV_daXoa là false
      .populate({
        path: 'NV_nguoiThucHien',
        select: 'NV_hoTen',
      })
      .exec();
  }

  async update(id: string, updateNhanVienDto: any): Promise<NHAN_VIEN | null> {
    return this.Staff.findByIdAndUpdate(id, updateNhanVienDto, {
      new: true,
    }).exec();
  }

  async delete(id: string): Promise<NHAN_VIEN | null> {
    return this.Staff.findByIdAndUpdate(
      id,
      { NV_daXoa: true },
      { new: true }
    ).exec();
  }

  async countAll(): Promise<number> {
    return this.Staff.countDocuments().exec();
  }
}
