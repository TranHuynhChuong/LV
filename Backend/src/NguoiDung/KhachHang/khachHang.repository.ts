import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, UpdateQuery } from 'mongoose';
import { KhachHang, KhachHangDocument } from './khachHang.schema';
import {
  PaginateResult,
  paginateRawAggregate,
} from 'src/Util/paginateWithFacet';

export type CustomerListResults = PaginateResult<KhachHangDocument>;

@Injectable()
export class KhachHangRepository {
  constructor(
    @InjectModel(KhachHang.name)
    private readonly model: Model<KhachHangDocument>
  ) {}

  async create(data: any): Promise<KhachHang> {
    const created = new this.model(data);
    return created.save();
  }

  async findAll(page: number, limit = 24): Promise<CustomerListResults> {
    const skip = (page - 1) * limit;

    const dataPipeline: PipelineStage[] = [
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const countPipeline: PipelineStage[] = [
      ...dataPipeline,
      { $count: 'count' },
    ];

    return paginateRawAggregate({
      model: this.model,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  async findByEmail(email: string): Promise<KhachHang | null> {
    return this.model.findOne({ KH_email: email }).exec();
  }

  async update(email: string, data: any): Promise<KhachHang | null> {
    const update: UpdateQuery<KhachHang> = { $set: data };

    return this.model
      .findOneAndUpdate({ KH_email: email }, update, {
        new: true,
        runValidators: true,
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
