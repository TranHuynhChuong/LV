import { Injectable } from '@nestjs/common';
import { locationData } from './data/dia-chi.data';

export interface XaPhuong {
  X_id: number;
  X_ten: string;
}

export interface DiaChi {
  T_id: number;
  T_ten: string;
  XaPhuong: XaPhuong[];
}

@Injectable()
export class DiaChiRepository {
  private readonly data: DiaChi[];

  constructor() {
    this.data = locationData;
  }
  getAllProvinces(): { T_id: number; T_ten: string }[] {
    return this.data.map(({ T_id, T_ten }) => ({ T_id, T_ten }));
  }

  getWardsByProvinceId(provinceId: number): XaPhuong[] {
    const province = this.data.find((d) => d.T_id === provinceId);
    return province?.XaPhuong ?? [];
  }

  getFullAddressText(provinceId: number, wardId: number): string | undefined {
    const province = this.data.find((d) => d.T_id === provinceId);
    if (!province) return undefined;

    const ward = province.XaPhuong.find((x) => x.X_id === wardId);
    if (!ward) return undefined;

    return `${ward.X_ten} - ${province.T_ten}`;
  }

  getProvinceInfo(
    provinceId: number
  ): { T_id: number; T_ten: string } | undefined {
    const province = this.data.find((d) => d.T_id === provinceId);
    if (!province) return undefined;

    return { T_id: province.T_id, T_ten: province.T_ten };
  }

  findAll(): DiaChi[] {
    return this.data;
  }

  findByProvinceId(id: number): DiaChi | undefined {
    return this.data.find((d) => d.T_id === id);
  }
}
