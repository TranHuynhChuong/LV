import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TheLoai, TheLoaiDocument } from './theLoai.schema';

@Injectable()
export class TheLoaiRepository {
  constructor(
    @InjectModel(TheLoai.name)
    private readonly TheLoai: Model<TheLoaiDocument>
  ) {}

  async create(data: any): Promise<TheLoai> {
    const created = new this.TheLoai(data);
    return created.save();
  }

  async findLastId(): Promise<number> {
    const result = await this.TheLoai.find({})
      .sort({ TL_id: -1 })
      .limit(1)
      .select('TL_id')
      .lean()
      .exec();

    if (result.length === 0) {
      return 0;
    }
    return result[0].TL_id;
  }

  async findAll(): Promise<TheLoai[]> {
    return this.TheLoai.find({ TL_daXoa: false }).lean().exec();
  }

  async findAllBasic(): Promise<Partial<TheLoai>[]> {
    return this.TheLoai.find({ TL_daXoa: false })
      .select('TL_id TL_ten TL_idTL')
      .lean()
      .exec();
  }

  async findById(id: number): Promise<TheLoai | null> {
    return this.TheLoai.findOne({ TL_id: id, TL_daXoa: false }).lean().exec();
  }

  async findByName(name: string): Promise<TheLoai | null> {
    return this.TheLoai.findOne({ TL_ten: name, TL_daXoa: false })
      .lean()
      .exec();
  }

  async update(id: number, data: any): Promise<TheLoai | null> {
    return this.TheLoai.findOneAndUpdate({ TL_id: id }, data, {
      new: true,
    }).exec();
  }

  async delete(id: number): Promise<TheLoai | null> {
    return this.TheLoai.findOneAndUpdate(
      { TL_id: id },
      { TL_daXoa: true },
      { new: true }
    ).exec();
  }

  async countAll(): Promise<number> {
    return this.TheLoai.countDocuments({ TL_daXoa: false }).exec();
  }
}
