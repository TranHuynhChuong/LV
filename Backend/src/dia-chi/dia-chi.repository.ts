import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TinhThanhDocument,
  TinhThanh,
  XaPhuong,
} from './schemas/dia-chi.schema';

@Injectable()
export class DiaChiRepository implements OnModuleInit {
  private location: TinhThanh[] | null = null;

  constructor(
    @InjectModel(TinhThanh.name)
    private readonly diaChiModel: Model<TinhThanhDocument>
  ) {}

  async onModuleInit(): Promise<void> {
    await this.fetchLocation();
  }

  async fetchLocation(): Promise<void> {
    this.location = await this.diaChiModel.find().lean();
  }

  private async ensureDataLoaded(): Promise<void> {
    if (!this.location) {
      await this.fetchLocation();
    }
  }

  async getAllProvinces(): Promise<{ T_id: number; T_ten: string }[]> {
    await this.ensureDataLoaded();
    return this.location!.map(({ T_id, T_ten }) => ({ T_id, T_ten }));
  }

  async getWardsByProvinceId(provinceId: number): Promise<XaPhuong[]> {
    await this.ensureDataLoaded();
    const province = this.location!.find((d) => d.T_id === provinceId);
    return province?.XaPhuong ?? [];
  }

  async getFullAddressText(
    provinceId: number,
    wardId: number
  ): Promise<string | undefined> {
    await this.ensureDataLoaded();
    const province = this.location!.find((d) => d.T_id === provinceId);
    if (!province) return undefined;

    const ward = province.XaPhuong.find((x) => x.X_id === wardId);
    if (!ward) return undefined;

    return `${ward.X_ten} - ${province.T_ten}`;
  }

  async getProvinceInfo(
    provinceId: number
  ): Promise<{ T_id: number; T_ten: string } | undefined> {
    await this.ensureDataLoaded();
    const province = this.location!.find((d) => d.T_id === provinceId);
    if (!province) return undefined;

    return { T_id: province.T_id, T_ten: province.T_ten };
  }

  async findAll(): Promise<TinhThanh[]> {
    await this.ensureDataLoaded();
    return this.location!;
  }

  async findByProvinceId(id: number): Promise<TinhThanh | undefined> {
    await this.ensureDataLoaded();
    return this.location!.find((d) => d.T_id === id);
  }
}
