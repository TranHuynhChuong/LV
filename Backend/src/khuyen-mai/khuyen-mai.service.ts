import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  KhuyenMaiRepository,
  PromotionFilterType,
} from './repositories/khuyen-mai.repository';
import { ChiTietKhuyenMaiRepository } from './repositories/chi-tiet-khuyen-mai.repository';
import { KhuyenMai } from './schemas/khuyen-mai.schema';
import { CreateKhuyenMaiDto } from './dto/create-khuyen-mai.dto';
import { UpdateKhuyenMaiDto } from './dto/update-khuyen-mai.dto';
import { NhanVienUtilService } from 'src/nguoi-dung/nhan-vien/nhan-vien.service';
import { ClientSession, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

// Bản đồ ánh xạ tên trường → nhãn để hiển thị lịch sử thao tác
const typeOfChange: Record<string, string> = {
  KM_ten: 'Tên',
  KM_batDau: 'Thời gian bắt đầu',
  KM_ketThuc: 'Thời gian kết thúc',
};

@Injectable()
export class KhuyenMaiUtilService {
  constructor(
    private readonly ChiTietKhuyenMaiRepo: ChiTietKhuyenMaiRepository,
    private readonly KhuyenMaiRepo: KhuyenMaiRepository
  ) {}

  /**
   * Trả về danh sách chi tiết khuyến mãi còn hiệu lực ứng với các sách có trong danh sách `ids`.
   *
   * @param {number[]} ids - Mảng các `bookId` cần truy vấn khuyến mãi.
   * @returns {Promise<any[]>} Danh sách các chi tiết khuyến mãi còn hiệu lực cho các sách tương ứng.
   */
  async getValidChiTietKhuyenMai(ids: number[]) {
    return this.ChiTietKhuyenMaiRepo.findValidByBookIds(ids);
  }

  /**
   * Cập nhật giá sau khuyến mãi cho một sách cụ thể dựa trên các khuyến mãi còn hiệu lực.
   *
   * Phương thức sẽ:
   * - Lấy tất cả các khuyến mãi chưa kết thúc.
   * - Duyệt qua từng khuyến mãi để tìm chi tiết khuyến mãi áp dụng cho sách có `S_id`.
   * - Tính giá sau giảm dựa trên loại giảm (theo tỷ lệ hoặc giá trị tuyệt đối).
   * - Cập nhật lại giá sau giảm vào bản ghi chi tiết khuyến mãi tương ứng.
   *
   * @param {number} S_id - ID của sách cần cập nhật giá khuyến mãi.
   * @param {number} S_giaBan - Giá bán gốc của sách.
   * @param {*} session - Phiên giao dịch hiện tại của cơ sở dữ liệu (Transaction session).
   * @returns {Promise<void>}
   */
  async updatePromotionOfBook(S_id: number, S_giaBan: number, session) {
    const KM_ids = await this.KhuyenMaiRepo.findAllNotEndedIds(session);
    for (const KM_id of KM_ids) {
      const CTKMs = await this.ChiTietKhuyenMaiRepo.findAllByPromotionId(
        KM_id,
        session
      );
      const CTKM = CTKMs.find((ct) => ct.S_id === S_id);
      if (!CTKM) continue;
      const { CTKM_giaTri, CTKM_theoTyLe } = CTKM;
      let giaSauGiam;
      if (CTKM_theoTyLe)
        giaSauGiam = Math.max(0, S_giaBan - (CTKM_giaTri / 100) * S_giaBan);
      else giaSauGiam = Math.max(0, S_giaBan - CTKM_giaTri);
      await this.ChiTietKhuyenMaiRepo.updateSalePriceForBooks(
        S_id,
        KM_id,
        giaSauGiam,
        session
      );
    }
  }
}

@Injectable()
export class KhuyenMaiService {
  constructor(
    private readonly NhanVienService: NhanVienUtilService,
    private readonly KhuyenMaiRepo: KhuyenMaiRepository,
    private readonly ChiTietKhuyenMaiRepo: ChiTietKhuyenMaiRepository,
    @InjectConnection() private readonly connection: Connection
  ) {}

  /**
   * Tạo mới một khuyến mãi cùng với các chi tiết khuyến mãi liên quan trong một phiên giao dịch.
   *
   * - Mở một phiên giao dịch (transaction).
   * - Tìm `KM_id` lớn nhất hiện tại và tạo `KM_id` mới.
   * - Ghi lại lịch sử thao tác tạo mới (gắn NV_id và thời gian).
   * - Tạo bản ghi khuyến mãi chính (`KhuyenMai`).
   * - Nếu có chi tiết khuyến mãi (`KM_chiTiet`), chèn kèm các chi tiết vào bảng chi tiết khuyến mãi.
   * - Trả về đối tượng khuyến mãi vừa tạo.
   * - Đảm bảo rollback nếu có lỗi xảy ra trong transaction.
   *
   * @param {CreateKhuyenMaiDto} data - Dữ liệu đầu vào để tạo khuyến mãi, bao gồm thông tin khuyến mãi và các chi tiết liên quan.
   * @returns {Promise<any>} Đối tượng khuyến mãi vừa được tạo (có thể là bản ghi từ cơ sở dữ liệu).
   * @throws {BadRequestException} Nếu việc tạo khuyến mãi thất bại.
   */

  async create(data: CreateKhuyenMaiDto) {
    const session = await this.connection.startSession();
    try {
      const result = await session.withTransaction(async () => {
        const lastId = await this.KhuyenMaiRepo.findLastId(session);
        const newId = lastId + 1;
        const thaoTac = {
          thaoTac: 'Tạo mới',
          NV_id: data.NV_id,
          thoiGian: new Date(),
        };
        const { KM_chiTiet, ...KhuyenMaiData } = data;
        const created = await this.KhuyenMaiRepo.create(
          {
            ...KhuyenMaiData,
            KM_id: newId,
            lichSuThaoTac: [thaoTac],
          },
          session
        );
        if (!created) {
          throw new BadRequestException(
            'Tạo khuyến mãi - Tạo khuyến mãi thất bại'
          );
        }
        if (KM_chiTiet && KM_chiTiet.length > 0) {
          const chiTietWithKMId = KM_chiTiet.map((ct) => ({
            ...ct,
            KM_id: newId,
          }));
          await this.ChiTietKhuyenMaiRepo.create(chiTietWithKMId, session);
        }
        return created;
      });
      return result;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new BadRequestException(`Tạo khuyến mãi - ${error?.message}`);
    } finally {
      await session.endSession();
    }
  }

  /**
   * Truy vấn danh sách khuyến mãi có phân trang và bộ lọc loại khuyến mãi (nếu có).
   *
   * @param {Object} params - Tham số truy vấn.
   * @param {number} params.page - Trang cần tìm.
   * @param {number} params.limit - Số lượng bản ghi trên mỗi trang.
   * @param {PromotionFilterType} [params.filterType] - (Tùy chọn) Loại khuyến mãi cần lọc.
   * @returns {Promise<any>} Danh sách khuyến mãi theo trang và bộ lọc.
   */
  async findAll(params: {
    page: number;
    limit: number;
    filterType?: PromotionFilterType;
  }) {
    return this.KhuyenMaiRepo.findAll(params);
  }

  /**
   * Tìm kiếm thông tin chi tiết của một khuyến mãi theo `KM_id`, kèm theo lọc loại khuyến mãi (nếu có).
   *
   * Phương thức sẽ:
   * - Gọi repository để lấy thông tin khuyến mãi và các chi tiết liên quan.
   * - Nếu không tìm thấy, ném lỗi `NotFoundException`.
   * - Nếu có lịch sử thao tác (`lichSuThaoTac`), ánh xạ thông tin nhân viên thực hiện từ `NhanVienService`.
   *
   * @param {number} KM_id - ID của khuyến mãi cần tìm.
   * @param {PromotionFilterType} [filterType] - (Tùy chọn) Loại khuyến mãi để lọc kết quả.
   * @returns {Promise<any>} Đối tượng khuyến mãi kèm chi tiết và lịch sử thao tác (nếu có).
   * @throws {NotFoundException} Nếu không tìm thấy khuyến mãi với `KM_id` đã cho.
   */
  async findById(
    KM_id: number,
    filterType?: PromotionFilterType
  ): Promise<any> {
    const result: any = await this.KhuyenMaiRepo.findAndGetDetailById(
      KM_id,
      filterType
    );
    if (!result) {
      throw new NotFoundException('Tìm khuyến mãi - Khuyến mãi không tồn tại');
    }
    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0
        ? await this.NhanVienService.mapActivityLog(lichSu)
        : [];
    return result;
  }

  /**
   * Cập nhật thông tin một khuyến mãi theo `id`, bao gồm cả thông tin chính và danh sách chi tiết khuyến mãi.
   *
   * Phương thức thực hiện trong một transaction, bao gồm:
   * - Kiểm tra sự tồn tại của khuyến mãi.
   * - So sánh và xác định các trường thay đổi trong dữ liệu chính.
   * - Xử lý cập nhật hoặc thay thế các chi tiết khuyến mãi nếu cần.
   * - Ghi nhận lịch sử thao tác nếu có thay đổi và có thông tin nhân viên.
   * - Tiến hành cập nhật dữ liệu nếu có thay đổi.
   *
   * @param {number} id - ID của khuyến mãi cần cập nhật.
   * @param {UpdateKhuyenMaiDto} newData - Dữ liệu mới dùng để cập nhật khuyến mãi.
   * @returns {Promise<KhuyenMai>} Đối tượng khuyến mãi sau khi đã được cập nhật.
   * @throws {NotFoundException} Nếu không tìm thấy khuyến mãi có `id` tương ứng.
   * @throws {BadRequestException} Nếu quá trình cập nhật thất bại.
   * @throws {InternalServerErrorException} Nếu xảy ra lỗi không xác định trong quá trình cập nhật.
   */
  async update(id: number, newData: UpdateKhuyenMaiDto): Promise<KhuyenMai> {
    const session = await this.connection.startSession();
    try {
      let updated: KhuyenMai;
      await session.withTransaction(async () => {
        const existing = await this.KhuyenMaiRepo.findById(id);
        if (!existing) {
          throw new NotFoundException(
            'Cập nhật khuyến mãi - Khuyến mãi không tồn tại'
          );
        }
        const { KM_chiTiet, ...khuyenMaiData } = newData;
        const { updatePayload, fieldsChange } = this.getUpdateFields(
          khuyenMaiData,
          existing
        );
        const isUpdateChiTiet = await this.processPromotionDetails(
          id,
          KM_chiTiet || [],
          session
        );
        if ((fieldsChange.length > 0 || isUpdateChiTiet) && newData.NV_id) {
          this.addActivityLog(
            updatePayload,
            existing,
            fieldsChange,
            isUpdateChiTiet,
            newData.NV_id
          );
        }
        if (Object.keys(updatePayload).length === 0) {
          updated = existing;
          return;
        }
        const updateResult = await this.KhuyenMaiRepo.update(
          id,
          updatePayload,
          session
        );
        if (!updateResult) {
          throw new BadRequestException(
            'Cập nhật khuyến mãi - Cập nhật khuyến mãi thất bại'
          );
        }
        updated = updateResult as KhuyenMai;
      });
      return updated!;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new InternalServerErrorException(
        `Cập nhật khuyến mãi - ${error.message}`
      );
    } finally {
      await session.endSession();
    }
  }

  /**
   * So sánh dữ liệu mới và cũ để xác định các trường có thay đổi, và xây dựng payload cập nhật.
   *
   * Phương thức này sẽ:
   * - Bỏ qua các trường `NV_id` và `KM_id` không cần xét cập nhật.
   * - So sánh từng trường trong `newData` và `oldData` (bao gồm so sánh thời gian nếu là kiểu `Date`).
   * - Ghi lại danh sách các trường đã thay đổi (gắn nhãn bằng `typeOfChange` nếu có).
   * - Tạo `updatePayload` chỉ chứa những trường cần cập nhật.
   *
   * @param {any} newData - Dữ liệu mới được truyền vào (ví dụ: từ client gửi lên).
   * @param {any} oldData - Dữ liệu cũ lấy từ cơ sở dữ liệu.
   * @returns {{ updatePayload: any; fieldsChange: string[] }}
   * Đối tượng chứa:
   * - `updatePayload`: các trường cần cập nhật.
   * - `fieldsChange`: danh sách tên các trường (hoặc nhãn hiển thị) đã thay đổi.
   */
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

  /**
   * Xử lý cập nhật danh sách chi tiết khuyến mãi của một khuyến mãi cụ thể (`KM_id`).
   *
   * Phương thức thực hiện so sánh danh sách chi tiết khuyến mãi hiện có trong cơ sở dữ liệu với danh sách mới truyền vào:
   * - Thêm mới nếu sách chưa từng có trong danh sách cũ.
   * - Cập nhật nếu có sự thay đổi về tỷ lệ, giá trị, hoặc trạng thái tạm ngưng.
   * - Xóa bỏ nếu chi tiết khuyến mãi cũ không còn tồn tại trong danh sách mới.
   *
   * Tất cả các thao tác được thực hiện trong một transaction thông qua `session`.
   *
   * @param {number} KM_id - ID của khuyến mãi cần xử lý chi tiết.
   * @param {any[]} newList - Danh sách chi tiết khuyến mãi mới (dạng mảng, mỗi phần tử chứa thông tin sách và thông tin khuyến mãi).
   * @param {ClientSession} session - Phiên giao dịch hiện tại (MongoDB transaction session).
   * @returns {Promise<boolean>} Trả về `true` nếu có thay đổi xảy ra (thêm, sửa, xóa); ngược lại trả về `false`.
   */
  private async processPromotionDetails(
    KM_id: number,
    newList: any[],
    session: ClientSession
  ): Promise<boolean> {
    const oldList = await this.ChiTietKhuyenMaiRepo.findAllByPromotionId(KM_id);
    const oldMap = new Map(oldList.map((item) => [item.S_id, item]));
    const newMap = new Map(newList.map((item) => [item.S_id, item]));
    const promises: Promise<any>[] = [];
    let changed = false;
    for (const newItem of newList) {
      const oldItem = oldMap.get(newItem.S_id);
      if (!oldItem) {
        changed = true;
        promises.push(
          this.ChiTietKhuyenMaiRepo.create([{ ...newItem, KM_id }], session)
        );
      } else if (
        oldItem.CTKM_theoTyLe !== newItem.CTKM_theoTyLe ||
        oldItem.CTKM_giaTri !== newItem.CTKM_giaTri ||
        oldItem.CTKM_tamNgung !== newItem.CTKM_tamNgung
      ) {
        changed = true;
        promises.push(
          this.ChiTietKhuyenMaiRepo.update(
            newItem.S_id,
            KM_id,
            {
              CTKM_theoTyLe: newItem.CTKM_theoTyLe,
              CTKM_giaTri: newItem.CTKM_giaTri,
              CTKM_tamNgung: newItem.CTKM_tamNgung,
              CTKM_giaSauGiam: newItem.CTKM_giaSauGiam,
            },
            session
          )
        );
      }
    }
    for (const oldItem of oldList) {
      if (!newMap.has(oldItem.S_id)) {
        changed = true;
        promises.push(
          this.ChiTietKhuyenMaiRepo.remove(KM_id, oldItem.S_id, session)
        );
      }
    }

    await Promise.all(promises);
    return changed;
  }

  /**
   * Ghi lại lịch sử thao tác cập nhật khuyến mãi vào `updatePayload`.
   *
   * Phương thức sẽ:
   * - Tạo một bản ghi lịch sử thao tác với nội dung cập nhật các trường thay đổi và thông tin nhân viên.
   * - Gộp lịch sử cũ (`existing.lichSuThaoTac`) với thao tác mới vào trường `lichSuThaoTac` của `updatePayload`.
   *
   * @param {any} updatePayload - Đối tượng chứa các trường sẽ được cập nhật (sẽ được thêm lịch sử thao tác).
   * @param {any} existing - Đối tượng khuyến mãi hiện tại (chứa lịch sử thao tác cũ).
   * @param {string[]} fieldsChange - Danh sách tên các trường đã bị thay đổi.
   * @param {boolean} isUpdateChiTiet - Có thay đổi chi tiết khuyến mãi sách hay không.
   * @param {string} NV_id - ID của nhân viên thực hiện thao tác.
   */
  private addActivityLog(
    updatePayload: any,
    existing: any,
    fieldsChange: string[],
    isUpdateChiTiet: boolean,
    NV_id: string
  ) {
    const thaoTac = {
      thaoTac: `Cập nhật: ${[
        ...fieldsChange,
        isUpdateChiTiet ? 'Thông tin khuyến mãi sách' : '',
      ]
        .filter(Boolean)
        .join(', ')}`,
      NV_id,
      thoiGian: new Date(),
    };

    updatePayload.lichSuThaoTac = [...existing.lichSuThaoTac, thaoTac];
  }

  /**
   * Đếm số lượng khuyến mãi còn hiệu lực tại thời điểm hiện tại.
   *
   * @returns {Promise<number>} Tổng số khuyến mãi còn hiệu lực.
   */
  async countValid(): Promise<number> {
    return this.KhuyenMaiRepo.countValid();
  }

  /**
   * Xóa một khuyến mãi và toàn bộ chi tiết khuyến mãi liên quan trong cơ sở dữ liệu.
   *
   * Phương thức sẽ:
   * - Kiểm tra sự tồn tại của khuyến mãi.
   * - Không cho phép xóa nếu khuyến mãi đang diễn ra (đang trong thời gian hiệu lực).
   * - Tiến hành xóa khuyến mãi và toàn bộ chi tiết liên quan trong một transaction.
   *
   * @param {number} id - ID của khuyến mãi cần xóa.
   * @returns {Promise<void>} Không trả về gì nếu xóa thành công.
   * @throws {NotFoundException} Nếu không tìm thấy khuyến mãi.
   * @throws {BadRequestException} Nếu khuyến mãi đang diễn ra và không thể xóa.
   */
  async delete(id: number): Promise<void> {
    const session: ClientSession = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const current = await this.KhuyenMaiRepo.findById(id, session);
        if (!current) {
          throw new NotFoundException(
            'Xóa khuyến mãi - Không tìm thấy khuyến mãi'
          );
        }
        const now = new Date();
        const isOngoing = current.KM_batDau <= now && now <= current.KM_ketThuc;
        if (isOngoing) {
          throw new BadRequestException(
            'Xóa khuyến mãi - Không thể xóa khi khuyến mãi đang diễn ra.'
          );
        }
        await this.KhuyenMaiRepo.delete(id, session);
        await this.ChiTietKhuyenMaiRepo.delete(id, session);
      });
    } finally {
      await session.endSession();
    }
  }
}
