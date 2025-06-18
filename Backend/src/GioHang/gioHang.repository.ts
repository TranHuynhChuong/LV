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
    KH_id: string;
    SP_id: number;
    GH_soLuong: number;
  }): Promise<GioHang> {
    const now = new Date();
    return this.model.create({
      ...data,
      GH_thoiGian: now,
    });
  }

  async update(data: {
    KH_id: string;
    SP_id: number;
    GH_soLuong: number;
  }): Promise<GioHang | null> {
    const now = new Date();

    return this.model.findOneAndUpdate(
      { KH_id: data.KH_id, SP_id: data.SP_id },
      {
        GH_soLuong: data.GH_soLuong,
        GH_thoiGian: now,
      },
      { new: true }
    );
  }

  async delete(KH_id: string, SP_id: number): Promise<GioHang | null> {
    return this.model.findOneAndDelete({ KH_id, SP_id });
  }

  async findAllByEmail(KH_id: string): Promise<GioHang[]> {
    return this.model.find({ KH_id }).sort({ GH_thoiGian: -1 });
  }

  async findOne(KH_id: string, SP_id: number): Promise<GioHang | null> {
    return this.model.findOne({ KH_id, SP_id });
  }
}
