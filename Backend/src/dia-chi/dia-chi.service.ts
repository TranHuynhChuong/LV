import { Injectable } from '@nestjs/common';
import { DiaChiRepository } from './dia-chi.repository';
import { TinhThanh, XaPhuong } from './schemas/dia-chi.schema';

@Injectable()
export class DiaChiService {
  constructor(private readonly DiaChiRepo: DiaChiRepository) {}

  /**
   * Lấy danh sách tất cả tỉnh/thành (chỉ id và tên)
   *
   * @returns Mảng đối tượng tỉnh/thành gồm T_id và T_ten
   */
  async findAllProvinces(): Promise<{ T_id: number; T_ten: string }[]> {
    return this.DiaChiRepo.findAllProvinces();
  }

  /**
   * Lấy danh sách phường/xã thuộc tỉnh/thành theo id
   *
   * @param provinceId Mã tỉnh/thành
   * @returns Mảng phường/xã
   */
  async findWardsByProvinceId(provinceId: number): Promise<XaPhuong[]> {
    return this.DiaChiRepo.findWardsByProvinceId(provinceId);
  }

  /**
   * Lấy địa chỉ đầy đủ dạng chuỗi theo mã tỉnh/thành và phường/xã
   *
   * @param provinceId Mã tỉnh/thành
   * @param wardId Mã phường/xã
   * @returns Địa chỉ đầy đủ (chuỗi) hoặc undefined nếu không tìm thấy
   */
  async getFullAddressText(
    provinceId: number,
    wardId: number
  ): Promise<string | undefined> {
    return this.DiaChiRepo.getFullAddressText(provinceId, wardId);
  }

  /**
   * Lấy thông tin tỉnh/thành theo id
   *
   * @param provinceId Mã tỉnh/thành
   * @returns Thông tin cơ bản của tỉnh/thành hoặc undefined nếu không tìm thấy
   */
  async getProvinceInfo(
    provinceId: number
  ): Promise<{ T_id: number; T_ten: string } | undefined> {
    return this.DiaChiRepo.getProvinceInfo(provinceId);
  }

  /**
   * Lấy danh sách đầy đủ các tỉnh/thành kèm thông tin chi tiết
   *
   * @returns Mảng tỉnh/thành
   */
  async findAll(): Promise<TinhThanh[]> {
    return this.DiaChiRepo.findAll();
  }

  /**
   * Lấy danh sách đầy đủ thông tin của tỉnh/thành
   *
   * @returns Thông tin đầy đủ của tỉnh/thành
   */
  async findProvinceId(id: number): Promise<TinhThanh | undefined> {
    return this.DiaChiRepo.getProvinceId(id);
  }

  /**
   *Làm mới (tải lại) dữ liệu địa chỉ
  
   * @returns Kết quả thao tác làm mới dữ liệu
   */
  async refetchLocation() {
    return this.DiaChiRepo.fetchLocation();
  }
}
