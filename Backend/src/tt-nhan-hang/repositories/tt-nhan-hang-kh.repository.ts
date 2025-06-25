import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import {
  TTNhanHangKH,
  TTNhanHangKHDocument,
} from '../schemas/tt-nhan-hang-kh.schema';

@Injectable()
export class TTNhanHangKHRepository {
  constructor(
    @InjectModel(TTNhanHangKH.name)
    private readonly NHkhachHangModel: Model<TTNhanHangKHDocument>
  ) {}

  // ========== TTNhanHangKH ==========

  async create(data: Partial<TTNhanHangKH>, session?: ClientSession) {
    return this.NHkhachHangModel.create([{ ...data }], { session }).then(
      (res) => res[0]
    );
  }

  async findAll(KH_id: number, session?: ClientSession) {
    return this.NHkhachHangModel.find({ KH_id })
      .session(session ?? null)
      .lean();
  }

  async findById(NH_id: number, KH_id: number, session?: ClientSession) {
    return this.NHkhachHangModel.findOne({ NH_id, KH_id })
      .session(session ?? null)
      .lean();
  }

  async update(
    NH_id: number,
    KH_id: number,
    data: Partial<TTNhanHangKH>,
    session?: ClientSession
  ) {
    return this.NHkhachHangModel.findOneAndUpdate({ NH_id, KH_id }, data, {
      new: true,
      session,
    });
  }

  async unsetDefaultOthers(
    NH_id: number,
    KH_id: number,
    session?: ClientSession
  ) {
    return this.NHkhachHangModel.updateMany(
      {
        KH_id,
        NH_id: { $ne: NH_id },
      },
      {
        $set: { NH_macDinh: false },
      },
      { session }
    );
  }

  async delete(NH_id: number, KH_id: number, session?: ClientSession) {
    return this.NHkhachHangModel.deleteOne({ NH_id, KH_id }, { session });
  }

  async findLastId(KH_id: number, session?: ClientSession) {
    const last = await this.NHkhachHangModel.findOne({ KH_id: KH_id })
      .sort({ NH_id: -1 })
      .select('NH_id')
      .session(session ?? null)
      .lean();
    return last?.NH_id ?? 0;
  }
}
