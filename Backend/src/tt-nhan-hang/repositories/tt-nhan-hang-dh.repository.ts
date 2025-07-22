import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import {
  TTNhanHangDH,
  TTNhanHangDHDocument,
} from '../schemas/tt-nhan-hang-dh.schema';

@Injectable()
export class TTNhanHangDHRepository {
  constructor(
    @InjectModel(TTNhanHangDH.name)
    private readonly TTNhanHangDHModel: Model<TTNhanHangDHDocument>
  ) {}

  // ========== TTNhanHangDH ==========

  async createDH(data: Partial<TTNhanHangDH>, session?: ClientSession) {
    return this.TTNhanHangDHModel.create([{ ...data }], { session }).then(
      (res) => res[0]
    );
  }

  async findByDHId(DH_id: string): Promise<TTNhanHangDH | null> {
    return this.TTNhanHangDHModel.findOne({ DH_id }).lean().exec();
  }

  async getStatsByProvince(
    dhIds: string[]
  ): Promise<{ provinceId: number; count: number }[]> {
    const stats = await this.TTNhanHangDHModel.aggregate([
      { $match: { DH_id: { $in: dhIds } } },
      {
        $group: {
          _id: '$T_id',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          provinceId: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    return stats as { provinceId: number; count: number }[];
  }
}
