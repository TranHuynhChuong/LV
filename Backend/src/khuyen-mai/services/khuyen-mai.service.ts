import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  KhuyenMaiRepository,
  PromotionFilterType,
} from '../repositories/khuyen-mai.repository';
import { ChiTietKhuyenMaiRepository } from '../repositories/chi-tiet-khuyen-mai.repository';
import { KhuyenMai } from '../schemas/khuyen-mai.schema';
import { CreateKhuyenMaiDto } from '../dto/create-khuyen-mai.dto';
import { UpdateKhuyenMaiDto } from '../dto/update-khuyen-mai.dto';
import { ClientSession, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { getNextSequence } from 'src/Util/counter.service';
import { DULIEU } from 'src/lich-su-thao-tac/schemas/lich-su-thao-tac.schema';
import { LichSuThaoTacService } from 'src/lich-su-thao-tac/services/lich-su-thao-tac.service';
import { plainToInstance } from 'class-transformer';
import { KhuyenMaiResponseDto } from '../dto/response-khuyen-mai.dto';

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
    private readonly LichSuThaoTacService: LichSuThaoTacService,
    private readonly KhuyenMaiRepo: KhuyenMaiRepository,
    private readonly ChiTietKhuyenMaiRepo: ChiTietKhuyenMaiRepository,
    @InjectConnection() private readonly connection: Connection
  ) {}

  /**
   * Tạo mới một khuyến mãi cùng với các chi tiết khuyến mãi liên quan trong một phiên giao dịch.
   *
   * @param data - Dữ liệu đầu vào để tạo khuyến mãi, bao gồm thông tin khuyến mãi và các chi tiết liên quan.
   * @returns Đối tượng khuyến mãi vừa được tạo (có thể là bản ghi từ cơ sở dữ liệu).
   */

  async create(newData: CreateKhuyenMaiDto) {
    const session = await this.connection.startSession();
    try {
      const result = await session.withTransaction(async () => {
        if (!this.connection.db) {
          throw new Error('Không thể kết nối cơ sở dữ liệu');
        }
        // Lấy giá trị seq tự tăng từ MongoDB
        const seq = await getNextSequence(
          this.connection.db,
          'promotionId',
          session
        );

        await this.LichSuThaoTacService.create({
          actionType: 'update',
          staffId: newData.NV_id ?? '',
          dataName: DULIEU.PROMOTION,
          dataId: seq,
          session: session,
        });

        const { KM_chiTiet, ...KhuyenMaiData } = newData;
        const created = await this.KhuyenMaiRepo.create(
          {
            ...KhuyenMaiData,
            KM_id: seq,
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
            KM_id: seq,
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
   * @returns Danh sách khuyến mãi theo trang và bộ lọc.
   */
  async findAll(params: {
    page: number;
    limit: number;
    filterType?: PromotionFilterType;
  }) {
    const { data, paginationInfo } = await this.KhuyenMaiRepo.findAll(params);
    return {
      data: plainToInstance(KhuyenMaiResponseDto, data, {
        excludeExtraneousValues: true,
      }),
      paginationInfo,
    };
  }

  /**
   * Tìm kiếm thông tin chi tiết của một khuyến mãi theo `KM_id`, kèm theo lọc loại khuyến mãi (nếu có).
   *
   * @param {number} id - ID của khuyến mãi cần tìm.
   * @param {PromotionFilterType} [filterType] - (Tùy chọn) Loại khuyến mãi để lọc kết quả.
   * @returns Đối tượng khuyến mãi kèm chi tiết và lịch sử thao tác (nếu có).
   */
  async findById(id: number, filterType?: PromotionFilterType) {
    const result = await this.KhuyenMaiRepo.findAndGetDetailById(
      id,
      filterType
    );
    if (!result) {
      throw new NotFoundException('Tìm khuyến mãi - Khuyến mãi không tồn tại');
    }

    return plainToInstance(KhuyenMaiResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Cập nhật thông tin một khuyến mãi theo `id`, bao gồm cả thông tin chính và danh sách chi tiết khuyến mãi.
   *
   * @param {number} id - ID của khuyến mãi cần cập nhật.
   * @param {UpdateKhuyenMaiDto} newData - Dữ liệu mới dùng để cập nhật khuyến mãi.
   * @returns {Promise<KhuyenMai>} Đối tượng khuyến mãi sau khi đã được cập nhật.
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
        const { KM_chiTiet } = newData;

        const { updatePayload } = await this.LichSuThaoTacService.create({
          actionType: 'update',
          staffId: newData.NV_id ?? '',
          dataName: DULIEU.PROMOTION,
          dataId: id,
          newData: newData,
          existingData: existing,
          ignoreFields: ['NV_id', 'KM_id'],
          session: session,
        });

        await this.processPromotionDetails(id, KM_chiTiet || [], session);

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
   * Xử lý cập nhật danh sách chi tiết khuyến mãi của một khuyến mãi cụ thể (`KM_id`).
   *
   * @param {number} id - ID của khuyến mãi cần xử lý chi tiết.
   * @param {any[]} newList - Danh sách chi tiết khuyến mãi mới (dạng mảng, mỗi phần tử chứa thông tin sách và thông tin khuyến mãi).
   * @param {ClientSession} session - Phiên giao dịch hiện tại (MongoDB transaction session).
   * @returns {Promise<boolean>} Trả về `true` nếu có thay đổi xảy ra (thêm, sửa, xóa); ngược lại trả về `false`.
   */
  private async processPromotionDetails(
    id: number,
    newList: any[],
    session: ClientSession
  ): Promise<boolean> {
    const oldList = await this.ChiTietKhuyenMaiRepo.findAllByPromotionId(id);
    const oldMap = new Map(oldList.map((item) => [item.S_id, item]));
    const newMap = new Map(newList.map((item) => [item.S_id, item]));
    const promises: Promise<any>[] = [];
    let changed = false;
    for (const newItem of newList) {
      const oldItem = oldMap.get(newItem.S_id);
      if (!oldItem) {
        changed = true;
        promises.push(
          this.ChiTietKhuyenMaiRepo.create([{ ...newItem, KM_id: id }], session)
        );
      } else if (
        oldItem.CTKM_theoTyLe !== newItem.CTKM_theoTyLe ||
        oldItem.CTKM_giaTri !== newItem.CTKM_giaTri
      ) {
        changed = true;
        promises.push(
          this.ChiTietKhuyenMaiRepo.update(
            newItem.S_id,
            id,
            {
              CTKM_theoTyLe: newItem.CTKM_theoTyLe,
              CTKM_giaTri: newItem.CTKM_giaTri,
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
          this.ChiTietKhuyenMaiRepo.remove(id, oldItem.S_id, session)
        );
      }
    }

    await Promise.all(promises);
    return changed;
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
