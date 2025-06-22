import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import {
  TTNhanHangKH,
  TTNhanHangKHDocument,
  TTNhanHangDH,
  TTNhanHangDHDocument,
} from './ttNhanhang.schema';

@Injectable()
export class TTNhanHangRepository {
  constructor(
    @InjectModel(TTNhanHangKH.name)
    private readonly NHkhachHangModel: Model<TTNhanHangKHDocument>,

    @InjectModel(TTNhanHangDH.name)
    private readonly NHdonHangModel: Model<TTNhanHangDHDocument>
  ) {}

  // ========== TTNhanHangKH ==========

  async createKH(data: Partial<TTNhanHangKH>, session?: ClientSession) {
    return this.NHkhachHangModel.create([{ ...data }], { session }).then(
      (res) => res[0]
    );
  }

  async findAllKHByKHId(KH_id: number, session?: ClientSession) {
    return this.NHkhachHangModel.find({ KH_id })
      .session(session ?? null)
      .lean();
  }

  async findKHById(NH_id: number, KH_id: number, session?: ClientSession) {
    return this.NHkhachHangModel.findOne({ NH_id, KH_id })
      .session(session ?? null)
      .lean();
  }

  async updateKH(
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

  async deleteKH(NH_id: number, KH_id: number, session?: ClientSession) {
    return this.NHkhachHangModel.deleteOne({ NH_id, KH_id }, { session });
  }

  async findLastIdNH(KH_id: number, session?: ClientSession) {
    const last = await this.NHkhachHangModel.findOne({ KH_id: KH_id })
      .sort({ NH_id: -1 })
      .select('NH_id')
      .session(session ?? null)
      .lean();
    return last?.NH_id ?? 0;
  }

  // ========== TTNhanHangDH ==========

  async createDH(data: Partial<TTNhanHangDH>, session?: ClientSession) {
    return this.NHdonHangModel.create([{ ...data }], { session }).then(
      (res) => res[0]
    );
  }

  async getByDHId(DH_id: string) {
    return this.NHdonHangModel.findOne({ DH_id }).exec();
  }

  async getByTId(T_id: number) {
    return this.NHdonHangModel.find({ T_id }).exec();
  }
}
