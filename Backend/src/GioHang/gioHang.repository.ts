import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GioHang, GioHangDocument } from './gioHang.schema';

@Injectable()
export class GioHangRepository {
  constructor(
    @InjectModel(GioHang.name)
    private readonly GioHangModel: Model<GioHangDocument>
  ) {}

  async create(data: {
    KH_id: number;
    SP_id: number;
    GH_soLuong: number;
  }): Promise<GioHang> {
    const now = new Date();
    return this.GioHangModel.create({
      ...data,
      GH_thoiGian: now,
    });
  }

  async update(
    KH_id: number,
    SP_id: number,
    GH_soLuong: number
  ): Promise<GioHang | null> {
    const now = new Date();
    return this.GioHangModel.findOneAndUpdate(
      { KH_id: KH_id, SP_id: SP_id },
      {
        GH_soLuong: GH_soLuong,
        GH_thoiGian: now,
      },
      { new: true }
    );
  }

  async delete(KH_id: number, SP_id: number): Promise<GioHang | null> {
    return this.GioHangModel.findOneAndDelete({ KH_id, SP_id });
  }

  async deleteMany(
    KH_id: number,
    SP_ids: number[]
  ): Promise<{ deletedCount: number }> {
    const result = await this.GioHangModel.deleteMany({
      KH_id,
      SP_id: { $in: SP_ids },
    });

    return { deletedCount: result.deletedCount };
  }

  async findAll(KH_id: number): Promise<GioHang[]> {
    return this.GioHangModel.find({ KH_id }).sort({ GH_thoiGian: -1 });
  }

  async findOne(KH_id: number, SP_id: number): Promise<GioHang | null> {
    return this.GioHangModel.findOne({ KH_id, SP_id });
  }
}
