import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DiaChi, DiaChiDocument } from './schemas/dia-chi.schema';

@Injectable()
export class DiaChiRepository {
  constructor(
    @InjectModel(DiaChi.name)
    private readonly DiaChiModel: Model<DiaChiDocument>
  ) {}

  async getAllTinh(): Promise<Partial<DiaChi>[]> {
    return this.DiaChiModel.find({}, { T_id: 1, T_ten: 1, _id: 0 }).exec();
  }

  async getXaPhuongByTinhId(tinhId: number): Promise<any[]> {
    const DiaChi = await this.DiaChiModel.findOne(
      { T_id: tinhId },
      { XaPhuong: 1, _id: 0 }
    ).exec();
    return DiaChi?.XaPhuong || [];
  }
}
