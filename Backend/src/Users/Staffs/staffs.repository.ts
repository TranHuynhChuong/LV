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

  async findMaxCode(): Promise<number> {
    const result = await this.Staff.find({})
      .sort({ NV_ma: -1 }) // Sắp xếp giảm dần theo mã
      .limit(1)
      .select('NV_ma') // Chỉ lấy trường NV_ma
      .lean();

    return result.length > 0 ? result[0].NV_ma : 0;
  }

  async findAll(): Promise<NHAN_VIEN[]> {
    return this.Staff.find({ NV_daXoa: false }) // Điều kiện NV_daXoa là false
      .populate({
        path: 'NV_nguoiThucHien',
        select: 'NV_hoTen',
      })
      .exec();
  }

  async findById(id: string): Promise<NHAN_VIEN | null> {
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
