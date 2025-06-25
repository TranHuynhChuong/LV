import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { DanhGia, DanhGiaDocument } from '../schemas/danh-gia.schema';

import {
  PaginateResult,
  paginateRawAggregate,
} from 'src/Util/paginateWithFacet';

export type DanhGiaListResults = PaginateResult<DanhGiaDocument>;

@Injectable()
export class DanhGiaRepository {
  constructor(
    @InjectModel(DanhGia.name)
    private readonly DanhGiaModel: Model<DanhGiaDocument>
  ) {}

  async create(data: Partial<DanhGia>): Promise<DanhGia> {
    const created = new this.DanhGiaModel(data);
    return created.save();
  }

  async findById(id: string) {
    return this.DanhGiaModel.findById(id).lean();
  }

  async findAllOfProduct(
    spId: number,
    page: number,
    limit = 24
  ): Promise<DanhGiaListResults> {
    const skip = (page - 1) * limit;

    const matchStage: PipelineStage.Match = {
      $match: { SP_id: spId, DG_daAn: false },
    };

    const dataPipeline: PipelineStage[] = [
      matchStage,
      { $sort: { DG_ngayTao: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const countPipeline: PipelineStage[] = [matchStage, { $count: 'count' }];

    return paginateRawAggregate({
      model: this.DanhGiaModel,
      page,
      limit,
      dataPipeline,
      countPipeline,
    });
  }

  async update(id: string, update: Partial<DanhGia>) {
    return this.DanhGiaModel.findByIdAndUpdate(id, update, { new: true });
  }

  async deleteById(id: string) {
    return this.DanhGiaModel.findByIdAndDelete(id);
  }
}
