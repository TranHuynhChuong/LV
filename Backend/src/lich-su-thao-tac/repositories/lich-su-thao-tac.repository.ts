import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import {
  LichSuThaoTac,
  LichSuThaoTacDocument,
} from '../schemas/lich-su-thao-tac.schema';

@Injectable()
export class LichSuThaoTacRepository {
  constructor(
    @InjectModel(LichSuThaoTac.name)
    private readonly lichSuThaoTacModel: Model<LichSuThaoTacDocument>
  ) {}

  /**
   * Tạo mới một bản ghi lịch sử thao tác.
   * @param data Dữ liệu tạo mới
   * @returns LichSuThaoTac đã được lưu
   */
  async create(
    data: LichSuThaoTac,
    session?: ClientSession
  ): Promise<LichSuThaoTac> {
    return this.lichSuThaoTacModel
      .create([data], { session })
      .then((res) => res[0]);
  }

  /**
   * Lấy lịch sử thao tác của một dữ liệu.
   * @param id id dữ liệu
   * @param data tên dữ liệu
   * @returns LichSuThaoTac hoặc null
   */
  async findByReference(
    id: string,
    dataName: string,
    skip: number = 0,
    limit: number = 10
  ): Promise<LichSuThaoTac[] | null> {
    return this.lichSuThaoTacModel
      .find({ idDuLieu: id, duLieu: dataName })
      .sort({ thoiGian: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }
}
