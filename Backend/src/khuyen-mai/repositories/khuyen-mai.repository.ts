import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { KhuyenMai, KhuyenMaiDocument } from '../schemas/khuyen-mai.schema';
import { Injectable } from '@nestjs/common';
import { paginateRawAggregate } from 'src/Util/paginateWithFacet';

export enum PromotionFilterType {
  Expired = 'expired',
  NotEnded = 'notEnded',
  Active = 'active',
}

@Injectable()
export class KhuyenMaiRepository {
  constructor(
    @InjectModel(KhuyenMai.name)
    private readonly KhuyenMaiModel: Model<KhuyenMaiDocument>
  ) {}

  protected getFilter(filterType?: PromotionFilterType): Record<string, any> {
    const now = new Date();
    switch (filterType) {
      case PromotionFilterType.Expired:
        return { KM_ketThuc: { $lt: now } };
      case PromotionFilterType.NotEnded:
        return { KM_ketThuc: { $gte: now } };
      case PromotionFilterType.Active:
        return {
          KM_batDau: { $lte: now },
          KM_ketThuc: { $gte: now },
        };
      default:
        return {};
    }
  }

  async findAll({
    page,
    limit,
    filterType,
  }: {
    page: number;
    limit: number;
    filterType?: PromotionFilterType;
  }) {
    const filter = this.getFilter(filterType);
    const dataPipeline: PipelineStage[] = [
      { $match: filter },
      {
        $lookup: {
          from: 'chitietkhuyenmais',
          localField: 'KM_id',
          foreignField: 'KM_id',
          as: 'chiTietList',
        },
      },
      {
        $addFields: {
          KM_slspTong: {
            $size: {
              $filter: {
                input: '$chiTietList',
                as: 'ct',
                cond: { $eq: ['$$ct.CTKM_daXoa', false] },
              },
            },
          },
        },
      },
      {
        $project: {
          lichSuThaoTac: 0,
          chiTietList: 0,
        },
      },
      { $sort: { KM_batDau: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const countPipeline: PipelineStage[] = [
      { $match: filter },
      { $count: 'count' },
    ];

    return paginateRawAggregate<KhuyenMaiDocument>({
      model: this.KhuyenMaiModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  async findById(id: string) {
    return this.KhuyenMaiModel.findOne({ KM_id: id }).exec();
  }

  async findAndGetDetailById(
    KM_id: string,
    filterType?: PromotionFilterType
  ): Promise<KhuyenMaiDocument | null> {
    const filter = this.getFilter(filterType);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          KM_id,
          ...filter,
        },
      },
      {
        $lookup: {
          from: 'chitietkhuyenmais',
          localField: 'KM_id',
          foreignField: 'KM_id',
          as: 'chiTietKhuyenMai',
        },
      },
      {
        $set: {
          chiTietKhuyenMai: {
            $filter: {
              input: '$chiTietKhuyenMai',
              as: 'ct',
              cond: { $eq: ['$$ct.CTKM_daXoa', false] },
            },
          },
        },
      },
      {
        $set: {
          SP_ids: {
            $map: {
              input: '$chiTietKhuyenMai',
              as: 'ct',
              in: '$$ct.SP_id',
            },
          },
        },
      },
      {
        $lookup: {
          from: 'sanphams',
          let: { sp_ids: '$SP_ids' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$SP_id', '$$sp_ids'] },
                    { $ne: ['$SP_trangThai', 0] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                SP_id: 1,
                SP_ten: 1,
                SP_giaBan: 1,
                SP_tonKho: 1,
                SP_giaNhap: 1,
                SP_anh: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: '$SP_anh',
                            as: 'anh',
                            cond: { $eq: ['$$anh.A_anhBia', true] },
                          },
                        },
                        as: 'anh',
                        in: '$$anh.A_url',
                      },
                    },
                    0,
                  ],
                },
              },
            },
          ],
          as: 'sanPhams',
        },
      },
      {
        $project: {
          _id: 0,
          KM_id: 1,
          KM_ten: 1,
          KM_moTa: 1,
          KM_batDau: 1,
          KM_ketThuc: 1,
          lichSuThaoTac: 1,
          chiTietKhuyenMai: 1,
          sanPhams: 1,
        },
      },
    ];

    const result = await this.KhuyenMaiModel.aggregate(pipeline);
    return (result[0] ?? null) as KhuyenMaiDocument | null;
  }

  async create(data: Partial<KhuyenMai>) {
    return this.KhuyenMaiModel.create(data);
  }

  async update(KM_id: string, update: Partial<KhuyenMai>) {
    return this.KhuyenMaiModel.findOneAndUpdate({ KM_id }, update, {
      new: true,
    });
  }

  async countValid(): Promise<number> {
    const now = new Date();
    // Assuming you are using Mongoose or similar ODM
    return this.KhuyenMaiModel.countDocuments({
      KM_batDau: { $lte: now },
      KM_ketThuc: { $gte: now },
    });
  }
}
