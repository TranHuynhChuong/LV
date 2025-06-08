import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KhuyenMaiRepository } from './khuyenMai.repository';
import { KhuyenMai } from './khuyenMai.schema';
import { CreateDto, UpdateDto } from './khuyenMai.dto';
import { NhanVienService } from 'src/NguoiDung/NhanVien/nhanVien.service';

const typeOfChange: Record<string, string> = {
  KM_ten: 'Tên',
  KM_batDau: 'Thời gian bắt đầu',
  KM_ketThuc: 'Thời gian kết thúc',
};

@Injectable()
export class KhuyenMaiService {
  constructor(
    private readonly khuyenMaiRepo: KhuyenMaiRepository,
    private readonly NhanVien: NhanVienService
  ) {}

  // Tạo khuyến mãi mới
  async createKhuyenMai(data: CreateDto) {
    const existing = await this.khuyenMaiRepo.findKhuyenMaiById(data.KM_id);
    if (existing) {
      throw new ConflictException('Mã khuyến mãi đã tồn tại');
    }

    const thaoTac = {
      thaoTac: 'Tạo mới',
      NV_id: data.NV_id,
      thoiGian: new Date(),
    };

    const { KM_chiTiet, ...khuyenMaiData } = data;

    // Tạo khuyến mãi chính
    const created = await this.khuyenMaiRepo.createKhuyenMai({
      ...khuyenMaiData,
      lichSuThaoTac: [thaoTac],
    });

    if (!created) {
      throw new BadRequestException('Không thể tạo khuyến mãi');
    }

    // Tạo chi tiết khuyến mãi nếu có
    if (KM_chiTiet && KM_chiTiet.length > 0) {
      const chiTietWithKMId = KM_chiTiet.map((ct) => ({
        ...ct,
      }));

      await this.khuyenMaiRepo.createChiTietKM(chiTietWithKMId);
    }

    return created;
  }

  // Lấy danh sách khuyến mãi phân trang và theo trạng thái (0: hết hạn, 1: còn hiệu lực)
  async getAllKhuyenMai(params: {
    page: number;
    limit: number;
    filterType?: 0 | 1;
  }) {
    return this.khuyenMaiRepo.findAllKhuyenMai(params);
  }

  // Lấy chi tiết khuyến mãi theo id
  async getKhuyenMaiById(KM_id: string): Promise<any> {
    const result: any = await this.khuyenMaiRepo.findKhuyenMaiById(KM_id);
    if (!result) {
      throw new NotFoundException();
    }
    console.log(result);
    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0 ? await this.NhanVien.mapActivityLog(lichSu) : [];

    return result;
  }

  async updateKhuyenMai(id: string, newData: UpdateDto): Promise<KhuyenMai> {
    const existing = await this.khuyenMaiRepo.findKhuyenMaiById(id);
    if (!existing) {
      throw new NotFoundException();
    }

    const { KM_chiTiet, ...khuyenMaiData } = newData;

    const fieldsChange: string[] = [];
    const updatePayload: any = {};

    for (const key of Object.keys(khuyenMaiData)) {
      if (
        khuyenMaiData[key] !== undefined &&
        khuyenMaiData[key] !== existing[key] &&
        key !== 'NV_id' &&
        key !== 'KM_id'
      ) {
        const label = typeOfChange[key] || key;
        fieldsChange.push(label);
        updatePayload[key] = khuyenMaiData[key];
      }
    }

    // ========== So sánh và xử lý Chi tiết Khuyến mãi ==========
    let isUpdateChiTiet = false;
    const oldChiTietKM = await this.khuyenMaiRepo.findChiTietKMByKM(id);
    const newChiTietKM = KM_chiTiet || [];

    const oldMap = new Map(oldChiTietKM.map((item) => [item.SP_id, item]));
    const newMap = new Map(newChiTietKM.map((item) => [item.SP_id, item]));

    const promises: Promise<any>[] = [];

    // 1. Thêm mới và cập nhật
    for (const newItem of newChiTietKM) {
      const oldItem = oldMap.get(newItem.SP_id);

      if (!oldItem) {
        isUpdateChiTiet = true;
        promises.push(
          this.khuyenMaiRepo.createChiTietKM([{ ...newItem, KM_id: id }])
        );
      } else if (
        oldItem.CTKM_tyLe !== newItem.CTKM_tyLe ||
        oldItem.CTKM_giaTri !== newItem.CTKM_giaTri ||
        oldItem.CTKM_tamNgung !== newItem.CTKM_tamNgung
      ) {
        isUpdateChiTiet = true;
        promises.push(
          this.khuyenMaiRepo.updateChiTietKM(newItem.SP_id, id, {
            CTKM_tyLe: newItem.CTKM_tyLe,
            CTKM_giaTri: newItem.CTKM_giaTri,
            CTKM_tamNgung: newItem.CTKM_tamNgung,
          })
        );
      }
    }

    // 2. Xóa chi tiết cũ không còn trong danh sách mới
    for (const oldItem of oldChiTietKM) {
      if (!newMap.has(oldItem.SP_id)) {
        isUpdateChiTiet = true;
        promises.push(this.khuyenMaiRepo.deleteOneChiTietKM(id, oldItem.SP_id));
      }
    }

    await Promise.all(promises);

    // ========== Lưu lại lịch sử thao tác nếu có thay đổi ==========
    if ((fieldsChange.length > 0 || isUpdateChiTiet) && newData.NV_id) {
      const thaoTac = {
        thaoTac: `Cập nhật: ${fieldsChange.join(', ')}${
          isUpdateChiTiet ? ', Chi tiết' : ''
        }`,
        NV_id: newData.NV_id,
        thoiGian: new Date(),
      };

      updatePayload.lichSuThaoTac = [...existing.lichSuThaoTac, thaoTac];
    }

    // Nếu không có thay đổi nào, trả lại bản ghi cũ
    if (Object.keys(updatePayload).length === 0) {
      return existing;
    }

    const updated = await this.khuyenMaiRepo.updateKhuyenMai(id, updatePayload);
    if (!updated) {
      throw new BadRequestException();
    }

    return updated;
  }

  // Xóa mềm khuyến mãi và các chi tiết khuyến mãi liên quan (song song)
  async deleteKhuyenMai(KM_id: string) {
    return this.khuyenMaiRepo.deleteKhuyenMai(KM_id);
  }

  // ========== Chi tiết Khuyến Mãi ==========

  // Lấy danh sách chi tiết khuyến mãi theo id khuyến mãi
  async getChiTietKMByKM(KM_id: string) {
    return this.khuyenMaiRepo.findChiTietKMByKM(KM_id);
  }

  // Tìm các chi tiết khuyến mãi hợp lệ theo danh sách SP_id
  async getValidChiTietKhuyenMai(SPIds: number[]) {
    return this.khuyenMaiRepo.findValidChiTietKhuyenMai(SPIds);
  }
}
