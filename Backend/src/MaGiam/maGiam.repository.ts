import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { MaGiam, MaGiamDocument } from './maGiam.schema';
import { Injectable } from '@nestjs/common';
import { paginateRawAggregate } from 'src/Util/paginateWithFacet';

@Injectable()
export class MaGiamRepository {
  constructor(
    @InjectModel(MaGiam.name)
    private readonly MaGiamModel: Model<MaGiamDocument>
  ) {}

  protected getFilter(
    filterType: number = 1,
    type: number = 0
  ): Record<string, any> {
    const filter: Record<string, any> = {};
    const now = new Date();

    if (filterType === 1) {
      filter.MG_ketThuc = { $gte: now }; // Chưa kết thúc
    } else if (filterType === 0) {
      filter.MG_ketThuc = { $lt: now }; // Đã hết hạn
    } else if (filterType === 2) {
      // Đang hiệu lực
      filter.MG_batDau = { $lte: now };
      filter.MG_ketThuc = { $gte: now };
    }

    if (type !== 0) {
      filter.MG_loai = type;
    }

    return filter;
  }

  async findAll({
    page,
    limit,
    filterType,
    type,
  }: {
    page: number;
    limit: number;
    filterType?: number;
    type?: number;
  }) {
    const filter = this.getFilter(filterType, type);
    const dataPipeline: PipelineStage[] = [
      { $match: filter },
      {
        $project: {
          lichSuThaoTac: 0,
        },
      },
      { $sort: { MG_batDau: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const countPipeline: PipelineStage[] = [
      { $match: filter },
      { $count: 'count' },
    ];

    return paginateRawAggregate<MaGiamDocument>({
      model: this.MaGiamModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  async findExisting(id: string) {
    return this.MaGiamModel.findOne({ MG_id: id }).exec();
  }

  async findById(
    id: string,
    filterType?: number,
    type?: number
  ): Promise<MaGiam | null> {
    const filter = this.getFilter(filterType, type);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          MG_id: id,
          ...filter,
        },
      },
    ];

    const result = await this.MaGiamModel.aggregate(pipeline);
    return (result[0] ?? null) as MaGiam | null;
  }

  async create(data: Partial<MaGiam>) {
    return this.MaGiamModel.create(data);
  }

  async update(id: string, update: Partial<MaGiam>) {
    return this.MaGiamModel.findOneAndUpdate({ MG_id: id }, update, {
      new: true,
    });
  }

  async countValid(): Promise<number> {
    const now = new Date();
    // Assuming you are using Mongoose or similar ODM
    return this.MaGiamModel.countDocuments({
      MG_batDau: { $lte: now },
      MG_ketThuc: { $gte: now },
    });
  }

  async checkValid(ids: string[]): Promise<MaGiam[]> {
    const now = new Date();

    return this.MaGiamModel.find({
      MG_id: { $in: ids },
      MG_batDau: { $lte: now },
      MG_ketThuc: { $gte: now },
    }).exec();
  }
}
