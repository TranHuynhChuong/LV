import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import {
  KhuyenMai,
  KhuyenMaiDocument,
  ChiTietKhuyenMai,
  ChiTietKhuyenMaiDocument,
} from './khuyenMai.schema';
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
    private readonly khuyenMaiModel: Model<KhuyenMaiDocument>,

    @InjectModel(ChiTietKhuyenMai.name)
    private readonly chiTietModel: Model<ChiTietKhuyenMaiDocument>
  ) {}
  // =============================== //
  // ========== KhuyenMai ========== //
  // =============================== //

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

  async findAllKhuyenMai({
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
      model: this.khuyenMaiModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  async findExisting(id: string) {
    return this.khuyenMaiModel.findOne({ KM_id: id }).exec();
  }

  async findKhuyenMaiById(
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
          as: 'sanPham',
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
          sanPham: 1,
        },
      },
    ];

    const result = await this.khuyenMaiModel.aggregate(pipeline);
    return (result[0] ?? null) as KhuyenMaiDocument | null;
  }

  async createKhuyenMai(data: Partial<KhuyenMai>) {
    return this.khuyenMaiModel.create(data);
  }

  async updateKhuyenMai(KM_id: string, update: Partial<KhuyenMai>) {
    return this.khuyenMaiModel.findOneAndUpdate({ KM_id }, update, {
      new: true,
    });
  }

  async countValid(): Promise<number> {
    const now = new Date();
    // Assuming you are using Mongoose or similar ODM
    return this.khuyenMaiModel.countDocuments({
      KM_batDau: { $lte: now },
      KM_ketThuc: { $gte: now },
    });
  }

  // ========== ChiTietKhuyenMai ==========

  async findValidChiTietKhuyenMai(SPIds: number[]) {
    const now = new Date();

    return this.chiTietModel.aggregate([
      {
        $match: {
          SP_id: { $in: SPIds },
          CTKM_daXoa: false,
          CTKM_tamNgung: false,
        },
      },
      {
        $lookup: {
          from: 'khuyenmais',
          localField: 'KM_id',
          foreignField: 'KM_id',
          as: 'khuyenMai',
        },
      },
      { $unwind: '$khuyenMai' },
      {
        $match: {
          'khuyenMai.KM_batDau': { $lte: now },
          'khuyenMai.KM_ketThuc': { $gte: now },
        },
      },
      {
        $project: {
          KM_id: 1,
          SP_id: 1,
          CTKM_theoTyLe: 1,
          CTKM_giaTri: 1,
          CTKM_tamNgung: 1,
        },
      },
    ]);
  }

  async findChiTietKMByKMid(KM_id: string): Promise<ChiTietKhuyenMai[]> {
    return this.chiTietModel.find({ KM_id, CTKM_daXoa: false }).lean().exec();
  }

  async createChiTietKM(data: Partial<ChiTietKhuyenMai>[]) {
    return this.chiTietModel.insertMany(data);
  }

  async updateChiTietKM(
    SP_id: number,
    KM_id: string,
    update: Partial<ChiTietKhuyenMai>
  ) {
    return this.chiTietModel.findOneAndUpdate(
      { SP_id: SP_id, KM_id, CTKM_daXoa: false },
      update,
      { new: true }
    );
  }

  async deleteOneChiTietKM(KM_id: string, SP_id: number) {
    return this.chiTietModel.updateOne(
      { KM_id, SP_id: SP_id },
      { CTKM_daXoa: true }
    );
  }
}
