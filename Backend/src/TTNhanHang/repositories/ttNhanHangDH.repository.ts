import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import {
  TTNhanHangDH,
  TTNhanHangDHDocument,
} from '../schemas/ttNhanhangDH.schema';

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

  async findByDHId(DH_id: string) {
    return this.TTNhanHangDHModel.findOne({ DH_id }).exec();
  }

  async findByTId(T_id: number) {
    return this.TTNhanHangDHModel.find({ T_id }).exec();
  }
}
