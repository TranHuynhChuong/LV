import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { TheLoai, TheLoaiDocument } from '../schemas/the-loai.schema';

@Injectable()
export class TheLoaiRepository {
  constructor(
    @InjectModel(TheLoai.name)
    private readonly TheLoaiModel: Model<TheLoaiDocument>
  ) {}

  async create(data: any, session?: ClientSession): Promise<TheLoai> {
    const created = new this.TheLoaiModel(data);
    return created.save({ session });
  }

  async findLastId(session?: ClientSession): Promise<number> {
    const result = await this.TheLoaiModel.find({})
      .sort({ TL_id: -1 })
      .limit(1)
      .select('TL_id')
      .session(session ?? null)
      .lean()
      .exec();

    return result.length > 0 ? result[0].TL_id : 0;
  }

  async findByName(
    name: string,
    session?: ClientSession
  ): Promise<TheLoai | null> {
    return this.TheLoaiModel.findOne({ TL_ten: name, TL_daXoa: false })
      .session(session ?? null)
      .lean()
      .exec();
  }

  async findAll(): Promise<Partial<TheLoai>[]> {
    return this.TheLoaiModel.find({ TL_daXoa: false })
      .select('TL_id TL_ten TL_idTL')
      .lean()
      .exec();
  }

  async findAllChildren(id: number): Promise<number[]> {
    const result = await this.TheLoaiModel.aggregate([
      {
        $match: { TL_id: id },
      },
      {
        $graphLookup: {
          from: 'theloais',
          startWith: '$TL_id',
          connectFromField: 'TL_id',
          connectToField: 'TL_idTL',
          as: 'descendants',
        },
      },
      {
        $project: {
          _id: 0,
          descendantIds: '$descendants.TL_id',
        },
      },
    ]).exec();

    if (!result || result.length === 0) return [];
    return result[0].descendantIds as number[];
  }

  async findById(id: number): Promise<TheLoai | null> {
    return this.TheLoaiModel.findOne({ TL_id: id, TL_daXoa: false })
      .lean()
      .exec();
  }

  async update(id: number, data: any): Promise<TheLoai | null> {
    return this.TheLoaiModel.findOneAndUpdate({ TL_id: id }, data, {
      new: true,
    }).exec();
  }

  async delete(id: number): Promise<TheLoai | null> {
    return this.TheLoaiModel.findOneAndUpdate(
      { TL_id: id },
      { TL_daXoa: true },
      { new: true }
    ).exec();
  }

  async countAll(): Promise<number> {
    return this.TheLoaiModel.countDocuments({ TL_daXoa: false }).exec();
  }
}
