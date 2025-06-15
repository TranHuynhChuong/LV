import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GioHang, GioHangDocument } from './gioHang.schema';

@Injectable()
export class GioHangRepository {
  constructor(
    @InjectModel(GioHang.name)
    private readonly model: Model<GioHangDocument>
  ) {}

  async create(data: {
    KH_email: string;
    SP_id: number;
    GH_soLuong: number;
  }): Promise<GioHang> {
    const now = new Date();
    return this.model.create({
      ...data,
      GH_thoiGian: now,
    });
  }

  async update(
    KH_email: string,
    SP_id: number,
    GH_soLuong: number
  ): Promise<GioHang | null> {
    return this.model.findOneAndUpdate(
      { KH_email, SP_id },
      {
        GH_soLuong,
        GH_thoiGian: new Date(),
      },
      { new: true } // trả về bản ghi sau khi cập nhật
    );
  }

  async delete(KH_email: string, SP_id: number): Promise<GioHang | null> {
    return this.model.findOneAndDelete({ KH_email, SP_id });
  }

  async findAllByEmail(KH_email: string): Promise<GioHang[]> {
    return this.model.find({ KH_email }).sort({ GH_thoiGian: -1 });
  }

  async findOne(KH_email: string, SP_id: number): Promise<GioHang | null> {
    return this.model.findOne({ KH_email, SP_id });
  }
}
