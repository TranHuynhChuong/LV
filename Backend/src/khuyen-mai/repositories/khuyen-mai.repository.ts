import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, PipelineStage } from 'mongoose';
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
          KM_slTong: {
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

  async findById(id: number, session?: ClientSession) {
    return this.KhuyenMaiModel.findOne({ KM_id: id })
      .session(session ?? null)
      .exec();
  }

  async findAndGetDetailById(
    KM_id: number,
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
          S_ids: {
            $map: {
              input: '$chiTietKhuyenMai',
              as: 'ct',
              in: '$$ct.S_id',
            },
          },
        },
      },
      {
        $lookup: {
          from: 'saches',
          let: { s_ids: '$S_ids' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$S_id', '$$s_ids'] },
                    { $ne: ['$S_trangThai', 'daXoa'] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                S_id: 1,
                S_ten: 1,
                S_giaBan: 1,
                S_tonKho: 1,
                S_giaNhap: 1,
                S_anh: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: '$S_anh',
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
          as: 'saches',
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
          saches: 1,
        },
      },
    ];

    const result = await this.KhuyenMaiModel.aggregate(pipeline);
    return (result[0] ?? null) as KhuyenMaiDocument | null;
  }

  async create(data: Partial<KhuyenMai>, session?: ClientSession) {
    return this.KhuyenMaiModel.create([{ ...data }], { session }).then(
      (res) => res[0]
    );
  }

  async delete(id: number, session?: ClientSession): Promise<boolean> {
    const result = await this.KhuyenMaiModel.findOneAndDelete({
      KM_id: id,
    }).session(session ?? null);
    return !!result;
  }

  async findLastId(session?: ClientSession): Promise<number> {
    const result = await this.KhuyenMaiModel.find({})
      .sort({ KM_id: -1 })
      .limit(1)
      .select('KM_id')
      .session(session ?? null)
      .lean()
      .exec();

    return result.length > 0 ? result[0].KM_id : 0;
  }

  async update(
    KM_id: number,
    update: Partial<KhuyenMai>,
    session?: ClientSession
  ) {
    return this.KhuyenMaiModel.findOneAndUpdate({ KM_id }, update, {
      new: true,
      session,
    });
  }

  async countValid(): Promise<number> {
    const now = new Date();
    return this.KhuyenMaiModel.countDocuments({
      KM_batDau: { $lte: now },
      KM_ketThuc: { $gte: now },
    });
  }
}
