import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KhachHang, KhachHangDocument } from './khachHang.schema';
import { PaginateRepository } from 'src/Util/cursor-pagination';

@Injectable()
export class KhachHangRepository extends PaginateRepository<KhachHangDocument> {
  constructor(
    @InjectModel(KhachHang.name)
    model: Model<KhachHangDocument>
  ) {
    super(model);
  }

  async create(data: any): Promise<KhachHang> {
    const created = new this.model(data);
    return created.save();
  }

  protected async findAllPaginated(
    mode: 'head' | 'tail' | 'cursor',
    direction: 'forward' | 'back' = mode === 'tail' ? 'back' : 'forward',
    cursorId?: string,
    skip = 0,
    limit = 24
  ): Promise<KhachHang[]> {
    const filter = {}; // filter rỗng, không lọc gì

    const result = await this.paginateCursor({
      cursorId: cursorId ?? '',
      skip,
      limit,
      filter,
      direction,
      project: {},
      mode,
    });

    return result as KhachHang[];
  }

  async findAllForward(cursorId: string, skip = 0, limit = 24) {
    return this.findAllPaginated('cursor', 'forward', cursorId, skip, limit);
  }

  async findAllBack(cursorId: string, skip = 0, limit = 24) {
    return this.findAllPaginated('cursor', 'back', cursorId, skip, limit);
  }

  async findAllHead(limit = 24) {
    return this.findAllPaginated('head', undefined, '', 0, limit);
  }

  async findAllTail(limit = 24) {
    return this.findAllPaginated('tail', undefined, '', 0, limit);
  }

  async findByEmail(email: string): Promise<KhachHang | null> {
    return this.model.findOne({ KH_email: email }).exec();
  }

  async update(email: string, data: any): Promise<KhachHang | null> {
    return this.model
      .findOneAndUpdate({ KH_email: email }, data, {
        new: true,
      })
      .exec();
  }

  async updateEmail(
    email: string,
    newEmail: string
  ): Promise<KhachHang | null> {
    return this.model
      .findOneAndUpdate(
        { KH_email: email },
        { KH_email: newEmail },
        {
          new: true,
        }
      )
      .exec();
  }

  async delete(email: string): Promise<KhachHang | null> {
    return this.model.findOneAndUpdate({ KH_email: email }).exec();
  }

  async countAll(): Promise<number> {
    return this.model.countDocuments().exec();
  }

  async countByMonthInCurrentYear(
    year: number,
    countsByMonth: number[]
  ): Promise<number[]> {
    const result = await this.model.aggregate([
      {
        $match: {
          KH_ngayTao: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$KH_ngayTao' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    result.forEach((item) => {
      countsByMonth[item.month - 1] = item.count;
    });

    return countsByMonth;
  }
}
