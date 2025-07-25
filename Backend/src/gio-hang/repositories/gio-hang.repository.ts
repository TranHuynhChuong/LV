import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GioHang, GioHangDocument } from '../schemas/gio-hang.schema';

@Injectable()
export class GioHangRepository {
  constructor(
    @InjectModel(GioHang.name)
    private readonly GioHangModel: Model<GioHangDocument>
  ) {}

  async create(data: {
    KH_id: number;
    S_id: number;
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
    S_id: number,
    GH_soLuong: number
  ): Promise<GioHang | null> {
    const now = new Date();
    return this.GioHangModel.findOneAndUpdate(
      { KH_id: KH_id, S_id: S_id },
      {
        GH_soLuong: GH_soLuong,
        GH_thoiGian: now,
      },
      { new: true }
    );
  }

  async updateMany(
    items: {
      KH_id: number;
      S_id: number;
      GH_soLuong: number;
    }[]
  ): Promise<void> {
    const operations = items.map((item) => ({
      updateOne: {
        filter: { KH_id: item.KH_id, S_id: item.S_id },
        update: {
          $set: { GH_soLuong: item.GH_soLuong },
        },
      },
    }));

    await this.GioHangModel.bulkWrite(operations);
  }

  async delete(KH_id: number, S_id: number): Promise<GioHang | null> {
    return this.GioHangModel.findOneAndDelete({ KH_id, S_id });
  }

  async deleteMany(
    KH_id: number,
    S_ids: number[]
  ): Promise<{ deletedCount: number }> {
    const result = await this.GioHangModel.deleteMany({
      KH_id,
      S_id: { $in: S_ids },
    });

    return { deletedCount: result.deletedCount };
  }

  async findAll(KH_id: number): Promise<GioHang[]> {
    return this.GioHangModel.find({ KH_id }).sort({ GH_thoiGian: -1 });
  }

  async findOne(KH_id: number, S_id: number): Promise<GioHang | null> {
    return this.GioHangModel.findOne({ KH_id, S_id });
  }
}
