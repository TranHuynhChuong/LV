import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TinhThanhDocument,
  TinhThanh,
  XaPhuong,
} from '../schemas/dia-chi.schema';

@Injectable()
export class DiaChiRepository implements OnModuleInit {
  private location: TinhThanh[] | null = null;

  constructor(
    @InjectModel(TinhThanh.name)
    private readonly diaChiModel: Model<TinhThanhDocument>
  ) {}

  /**
   * Hàm chạy khi module được khởi tạo,
   * tự động tải dữ liệu địa chỉ lên bộ nhớ cache
   */
  async onModuleInit(): Promise<void> {
    await this.fetchLocation();
  }

  /**
   * Tải lại toàn bộ dữ liệu địa chỉ từ database
   */
  async fetchLocation(): Promise<void> {
    this.location = await this.diaChiModel.find().lean();
  }

  /**
   * Đảm bảo dữ liệu đã được tải lên cache trước khi sử dụng
   */
  private async ensureDataLoaded(): Promise<void> {
    if (!this.location) {
      await this.fetchLocation();
    }
  }

  /**
   * Lấy danh sách tất cả tỉnh/thành (chỉ id và tên)
   *
   * @returns Mảng đối tượng tỉnh/thành gồm T_id và T_ten
   */
  async findAllProvinces(): Promise<{ T_id: number; T_ten: string }[]> {
    await this.ensureDataLoaded();
    return this.location!.map(({ T_id, T_ten }) => ({ T_id, T_ten }));
  }

  /**
   * Lấy danh sách phường/xã thuộc tỉnh/thành theo id
   *
   * @param provinceId Mã tỉnh/thành
   * @returns Mảng phường/xã hoặc mảng rỗng nếu không tìm thấy
   */
  async findWardsByProvinceId(provinceId: number): Promise<XaPhuong[]> {
    await this.ensureDataLoaded();
    const province = this.location!.find((d) => d.T_id === provinceId);
    return province?.XaPhuong ?? [];
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
    await this.ensureDataLoaded();
    const province = this.location!.find((d) => d.T_id === provinceId);
    if (!province) return undefined;
    const ward = province.XaPhuong.find((x) => x.X_id === wardId);
    if (!ward) return undefined;
    return `${ward.X_ten} - ${province.T_ten}`;
  }

  /**
   * Lấy thông tin tỉnh/thành theo id
   *
   * @param provinceId Mã tỉnh/thành
   * @returns Đối tượng tỉnh/thành gồm T_id, T_ten hoặc undefined nếu không tìm thấy
   */
  async getProvinceInfo(
    provinceId: number
  ): Promise<{ T_id: number; T_ten: string } | undefined> {
    await this.ensureDataLoaded();
    const province = this.location!.find((d) => d.T_id === provinceId);
    if (!province) return undefined;
    return { T_id: province.T_id, T_ten: province.T_ten };
  }

  /**
   * Lấy toàn bộ dữ liệu địa chỉ tỉnh/thành kèm phường/xã
   *
   * @returns Mảng tỉnh/thành đầy đủ
   */
  async findAll(): Promise<TinhThanh[]> {
    await this.ensureDataLoaded();
    return this.location!;
  }

  /**
   * Lấy đối tượng tỉnh/thành theo id
   *
   * @param id Mã tỉnh/thành
   * @returns Đối tượng tỉnh/thành hoặc undefined nếu không tìm thấy
   */
  async getProvinceId(id: number): Promise<TinhThanh | undefined> {
    await this.ensureDataLoaded();
    return this.location!.find((d) => d.T_id === id);
  }
}
