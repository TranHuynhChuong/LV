import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { MaGiam, MaGiamDocument } from './maGiam.schema';
import { Injectable } from '@nestjs/common';
import { paginateRawAggregate } from 'src/Util/paginateWithFacet';

export enum VoucherFilterType {
  Expired = 'expired',
  NotEnded = 'notEnded',
  Active = 'active',
}

export enum VoucherType {
  Shipping = 'shipping',
  Order = 'order',
  All = 'all',
}

@Injectable()
export class MaGiamRepository {
  constructor(
    @InjectModel(MaGiam.name)
    private readonly MaGiamModel: Model<MaGiamDocument>
  ) {}

  protected getFilter(
    filterType?: VoucherFilterType,
    type?: VoucherType
  ): Record<string, any> {
    const filter: Record<string, any> = {};
    const now = new Date();

    switch (filterType) {
      case VoucherFilterType.NotEnded:
        filter.MG_ketThuc = { $gte: now };
        break;

      case VoucherFilterType.Expired:
        filter.MG_ketThuc = { $lt: now };
        break;

      case VoucherFilterType.Active:
        filter.MG_batDau = { $lte: now };
        filter.MG_ketThuc = { $gte: now };
        break;
    }

    if (type !== VoucherType.All) {
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
    filterType?: VoucherFilterType;
    type?: VoucherType;
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

  async findAllValid() {
    const filter = this.getFilter(VoucherFilterType.Active);

    return this.MaGiamModel.find(filter)
      .select('-lichSuThaoTac')
      .sort({ MG_batDau: -1 })
      .lean();
  }

  async findExisting(id: string) {
    return this.MaGiamModel.findOne({ MG_id: id }).exec();
  }

  async findById(
    id: string,
    filterType?: VoucherFilterType,
    type?: VoucherType
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
