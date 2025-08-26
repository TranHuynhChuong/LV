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

  /**
   * Tạo mới một thể loại
   *
   * @param data Dữ liệu thể loại cần tạo
   * @param session Phiên giao dịch MongoDB (tuỳ chọn)
   * @returns Promise trả về thể loại đã tạo
   */
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

  /**
   * Tìm thể loại theo tên, chỉ tìm thể loại chưa bị xóa
   *
   * @param name Tên thể loại cần tìm
   * @param session Phiên giao dịch MongoDB (tuỳ chọn)
   * @returns Promise trả về thể loại hoặc null nếu không tìm thấy
   */
  async findByName(
    name: string,
    session?: ClientSession
  ): Promise<TheLoai | null> {
    return this.TheLoaiModel.findOne({ TL_ten: name, TL_daXoa: false })
      .session(session ?? null)
      .lean()
      .exec();
  }

  /**
   * Lấy danh sách tất cả thể loại chưa bị xóa, chỉ lấy các trường TL_id, TL_ten, TL_idTL
   *
   * @returns Promise trả về mảng thể loại dạng Partial (chỉ có một số trường)
   */
  async findAll(): Promise<Partial<TheLoai>[]> {
    return this.TheLoaiModel.find({ TL_daXoa: false })
      .select('TL_id TL_ten TL_idTL')
      .lean()
      .exec();
  }

  /**
   * Tìm tất cả thể loại con (đệ quy) của thể loại theo ID
   *
   * @param id ID thể loại cha cần tìm các thể loại con
   * @returns Promise trả về mảng ID các thể loại con
   */
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

  /**
   * Tìm thể loại theo ID, chỉ thể loại chưa bị xóa
   *
   * @param id ID thể loại cần tìm
   * @returns Promise trả về thể loại hoặc null nếu không tìm thấy
   */
  async findById(id: number): Promise<TheLoai | null> {
    return this.TheLoaiModel.findOne({ TL_id: id, TL_daXoa: false })
      .lean()
      .exec();
  }

  /**
   * Cập nhật thông tin thể loại theo ID
   *
   * @param id ID thể loại cần cập nhật
   * @param data Dữ liệu cập nhật
   * @returns Promise trả về thể loại đã cập nhật hoặc null nếu không tìm thấy
   */
  async update(
    id: number,
    data: any,
    session?: ClientSession
  ): Promise<TheLoai | null> {
    return this.TheLoaiModel.findOneAndUpdate({ TL_id: id }, data, {
      new: true,
      session,
    }).exec();
  }

  /**
   * Xóa mềm thể loại theo ID (cập nhật cờ TL_daXoa thành true)
   *
   * @param id ID thể loại cần xóa
   * @returns Promise trả về thể loại đã xóa mềm hoặc null nếu không tìm thấy
   */
  async delete(id: number, session?: ClientSession): Promise<TheLoai | null> {
    return this.TheLoaiModel.findOneAndUpdate(
      { TL_id: id },
      { TL_daXoa: true },
      { new: true, session }
    ).exec();
  }

  /**
   * Đếm tổng số thể loại chưa bị xóa
   *
   * @returns Promise trả về số lượng thể loại
   */
  async countAll(): Promise<number> {
    return this.TheLoaiModel.countDocuments({ TL_daXoa: false }).exec();
  }
}
