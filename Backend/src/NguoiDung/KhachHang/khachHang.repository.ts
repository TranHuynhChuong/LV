import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KhachHang, KhachHangDocument } from './khachHang.schema';

@Injectable()
export class KhachHangRepository {
  constructor(
    @InjectModel(KhachHang.name)
    private readonly KhachHang: Model<KhachHangDocument>
  ) {}

  async create(data: any): Promise<KhachHang> {
    const created = new this.KhachHang(data);
    return created.save();
  }

  async findAll(page: number, limit: number): Promise<KhachHang[]> {
    const start = page * limit;
    return this.KhachHang.find()
      .select('KH_email KH_hoTen')
      .skip(start)
      .limit(limit)
      .exec();
  }

  async findByEmail(email: string): Promise<KhachHang | null> {
    return this.KhachHang.findOne({ KH_email: email }).exec();
  }

  async update(email: string, data: any): Promise<KhachHang | null> {
    return this.KhachHang.findOneAndUpdate({ KH_email: email }, data, {
      new: true,
    }).exec();
  }

  async updateEmail(
    email: string,
    newEmail: string
  ): Promise<KhachHang | null> {
    return this.KhachHang.findOneAndUpdate(
      { KH_email: email },
      { KH_email: newEmail },
      {
        new: true,
      }
    ).exec();
  }

  async delete(email: string): Promise<KhachHang | null> {
    return this.KhachHang.findOneAndUpdate({ KH_email: email }).exec();
  }

  async countAll(): Promise<number> {
    return this.KhachHang.countDocuments().exec();
  }

  async countByMonthInCurrentYear(
    year: number,
    countsByMonth: number[]
  ): Promise<number[]> {
    const result = await this.KhachHang.aggregate([
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
