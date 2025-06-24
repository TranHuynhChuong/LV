import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  KhuyenMaiRepository,
  PromotionFilterType,
} from './khuyenMai.repository';
import { KhuyenMai } from './khuyenMai.schema';
import { CreateDto, UpdateDto } from './khuyenMai.dto';
import { NhanVienUtilService } from 'src/NguoiDung/NhanVien/nhanVien.service';

const typeOfChange: Record<string, string> = {
  KM_ten: 'Tên',
  KM_batDau: 'Thời gian bắt đầu',
  KM_ketThuc: 'Thời gian kết thúc',
};

@Injectable()
export class KhuyenMaiUtilService {
  constructor(private readonly KhuyenMai: KhuyenMaiRepository) {}
  // Tìm các chi tiết khuyến mãi hợp lệ theo danh sách SP_id
  async getValidChiTietKhuyenMai(SPIds: number[]) {
    return this.KhuyenMai.findValidChiTietKhuyenMai(SPIds);
  }
}

@Injectable()
export class KhuyenMaiService {
  constructor(
    private readonly KhuyenMai: KhuyenMaiRepository,
    private readonly NhanVien: NhanVienUtilService
  ) {}

  //=========================== Tạo khuyến mãi mới=======================================
  async createKhuyenMai(data: CreateDto) {
    const existing = await this.KhuyenMai.findExisting(data.KM_id);
    if (existing) {
      throw new ConflictException('Mã khuyến mãi đã tồn tại');
    }

    const thaoTac = {
      thaoTac: 'Tạo mới',
      NV_id: data.NV_id,
      thoiGian: new Date(),
    };

    const { KM_chiTiet, ...KhuyenMaiData } = data;

    // Tạo khuyến mãi chính
    const created = await this.KhuyenMai.createKhuyenMai({
      ...KhuyenMaiData,
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

      await this.KhuyenMai.createChiTietKM(chiTietWithKMId);
    }

    return created;
  }

  //=========== Lấy danh sách khuyến mãi phân trang và theo trạng thái (0: đã kết thúc, 1: chưa kết thúc) ==============
  async getAllKhuyenMai(params: {
    page: number;
    limit: number;
    filterType?: PromotionFilterType;
  }) {
    return this.KhuyenMai.findAllKhuyenMai(params);
  }

  // =======================Lấy chi tiết khuyến mãi theo id==========================
  async getKhuyenMaiById(
    KM_id: string,
    filterType?: PromotionFilterType
  ): Promise<any> {
    const result: any = await this.KhuyenMai.findKhuyenMaiById(
      KM_id,
      filterType
    );
    if (!result) {
      throw new NotFoundException();
    }
    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0 ? await this.NhanVien.mapActivityLog(lichSu) : [];

    return result;
  }

  // ==================== Cập nhật khuyến mãi =======================================
  async updateKhuyenMai(id: string, newData: UpdateDto): Promise<KhuyenMai> {
    const existing = await this.KhuyenMai.findKhuyenMaiById(id);
    if (!existing) throw new NotFoundException();

    const { KM_chiTiet, ...khuyenMaiData } = newData;

    const { updatePayload, fieldsChange } = this.getUpdateFields(
      khuyenMaiData,
      existing
    );

    const isUpdateChiTiet = await this.processChiTietKhuyenMai(
      id,
      KM_chiTiet || []
    );

    if ((fieldsChange.length > 0 || isUpdateChiTiet) && newData.NV_id) {
      this.addLichSuThaoTac(
        updatePayload,
        existing,
        fieldsChange,
        isUpdateChiTiet,
        newData.NV_id
      );
    }

    if (Object.keys(updatePayload).length === 0) return existing;

    const updated = await this.KhuyenMai.updateKhuyenMai(id, updatePayload);
    if (!updated) throw new BadRequestException();

    return updated;
  }
  // Xác định loại cập nhật
  private getUpdateFields(
    newData: any,
    oldData: any
  ): { updatePayload: any; fieldsChange: string[] } {
    const updatePayload: any = {};
    const fieldsChange: string[] = [];

    for (const key of Object.keys(newData)) {
      if (key === 'NV_id' || key === 'KM_id') continue;

      const newValue = newData[key];
      const oldValue = oldData[key];

      const isChanged =
        oldValue instanceof Date && newValue instanceof Date
          ? oldValue.getTime() !== newValue.getTime()
          : newValue !== undefined && newValue !== oldValue;

      if (isChanged) {
        const label = typeOfChange[key] || key;
        fieldsChange.push(label);
        updatePayload[key] = newValue;
      }
    }

    return { updatePayload, fieldsChange };
  }

  // Kiểm tra cập nhật các chi tiết khuyến mãi
  private async processChiTietKhuyenMai(
    KM_id: string,
    newList: any[]
  ): Promise<boolean> {
    const oldList = await this.KhuyenMai.findChiTietKMByKMid(KM_id);
    const oldMap = new Map(oldList.map((item) => [item.SP_id, item]));
    const newMap = new Map(newList.map((item) => [item.SP_id, item]));

    const promises: Promise<any>[] = [];
    let changed = false;

    for (const newItem of newList) {
      const oldItem = oldMap.get(newItem.SP_id);
      if (!oldItem) {
        changed = true;
        promises.push(this.KhuyenMai.createChiTietKM([{ ...newItem, KM_id }]));
      } else if (
        oldItem.CTKM_theoTyLe !== newItem.CTKM_theoTyLe ||
        oldItem.CTKM_giaTri !== newItem.CTKM_giaTri ||
        oldItem.CTKM_tamNgung !== newItem.CTKM_tamNgung
      ) {
        changed = true;
        promises.push(
          this.KhuyenMai.updateChiTietKM(newItem.SP_id, KM_id, {
            CTKM_theoTyLe: newItem.CTKM_theoTyLe,
            CTKM_giaTri: newItem.CTKM_giaTri,
            CTKM_tamNgung: newItem.CTKM_tamNgung,
          })
        );
      }
    }

    for (const oldItem of oldList) {
      if (!newMap.has(oldItem.SP_id)) {
        changed = true;
        promises.push(this.KhuyenMai.deleteOneChiTietKM(KM_id, oldItem.SP_id));
      }
    }

    await Promise.all(promises);
    return changed;
  }
  // Thêm lịch sử thao tác cập nhật
  private addLichSuThaoTac(
    updatePayload: any,
    existing: any,
    fieldsChange: string[],
    isUpdateChiTiet: boolean,
    NV_id: string
  ) {
    const thaoTac = {
      thaoTac: `Cập nhật: ${fieldsChange.join(', ')}${isUpdateChiTiet ? ', Chi tiết' : ''}`,
      NV_id,
      thoiGian: new Date(),
    };

    updatePayload.lichSuThaoTac = [...existing.lichSuThaoTac, thaoTac];
  }

  async countValid(): Promise<number> {
    return this.KhuyenMai.countValid();
  }

  // ========== Chi tiết Khuyến Mãi ==========

  // Lấy danh sách chi tiết khuyến mãi theo id khuyến mãi
  async getChiTietKMByKMid(KM_id: string) {
    return this.KhuyenMai.findChiTietKMByKMid(KM_id);
  }
}
