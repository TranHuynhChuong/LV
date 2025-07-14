import { Injectable } from '@nestjs/common';
import { DiaChiRepository } from './dia-chi.repository';

@Injectable()
export class DiaChiService {
  constructor(private readonly repo: DiaChiRepository) {}

  async getDanhSachTinh() {
    return this.repo.getAllTinh();
  }

  async getXaPhuongTheoTinh(tinhId: number) {
    return this.repo.getXaPhuongByTinhId(tinhId);
  }
}
