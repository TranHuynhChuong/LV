import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  forwardRef,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { TheLoaiRepository } from './repositories/the-loai.repository';
import { TheLoai } from './schemas/the-loai.schema';

@Injectable()
export class TheLoaiUtilService {
  constructor(private readonly TheLoaiRepo: TheLoaiRepository) {}

  /**
   * Tìm tất cả ID các thể loại con (đệ quy) của thể loại theo ID cha.
   * Nếu không truyền ID, trả về mảng rỗng.
   *
   * @param id ID thể loại cha cần tìm các thể loại con (có thể không truyền)
   * @returns Promise trả về mảng ID các thể loại con, hoặc mảng rỗng nếu không truyền id hoặc không tìm thấy
   */
  async findAllChildren(id?: number): Promise<number[]> {
    if (!id) return [];
    return this.TheLoaiRepo.findAllChildren(id);
  }
}

import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { SachUtilService } from 'src/sach/sach.service';
import { CreateTheLoaiDto } from './dto/create-the-loai.dto';
import { UpdateTheLoaiDto } from './dto/update-th-loai.dto';
import { getNextSequence } from 'src/Util/counter.service';
import { LichSuThaoTacService } from 'src/lich-su-thao-tac/lich-su-thao-tac.service';
import { DULIEU } from 'src/lich-su-thao-tac/schemas/lich-su-thao-tac.schema';
@Injectable()
export class TheLoaiService {
  constructor(
    private readonly TheLoaiRepo: TheLoaiRepository,
    private readonly LichSuThaoTacService: LichSuThaoTacService,
    @InjectConnection() private readonly connection: Connection,
    @Inject(forwardRef(() => SachUtilService))
    private readonly SachService: SachUtilService
  ) {}

  /**
   * Tạo mới một thể loại sách.
   *
   * @param newData Dữ liệu thể loại mới cần tạo (theo DTO CreateTheLoaiDto)
   * @returns Promise trả về đối tượng thể loại vừa được tạo (TheLoai)
   */
  async create(newData: CreateTheLoaiDto): Promise<TheLoai> {
    const session = await this.connection.startSession();
    try {
      let result: TheLoai;
      await session.withTransaction(async () => {
        if (!this.connection.db) {
          throw new Error('Không thể kết nối cơ sở dữ liệu');
        }
        // Lấy giá trị seq tự tăng từ MongoDB
        const seq = await getNextSequence(
          this.connection.db,
          'categoryId',
          session
        );
        const created = await this.TheLoaiRepo.create(
          {
            ...newData,
            TL_id: seq,
          },
          session
        );
        if (!created) {
          throw new BadRequestException('Tạo thể loại - Tạo thất bại');
        }
        await this.LichSuThaoTacService.create({
          actionType: 'create',
          staffId: newData.NV_id ?? '',
          dataName: DULIEU.CATEGORY,
          dataId: seq,
          session: session,
        });
        result = created;
      });
      return result!;
    } catch {
      await session.abortTransaction();
      throw new BadRequestException('Tạo thể loại - Tạo thất bại');
    } finally {
      await session.endSession();
    }
  }

  /**
   * Cập nhật thông tin thể loại sách theo `id`.
   *
   * @param id ID của thể loại cần cập nhật
   * @param newData Dữ liệu cập nhật cho thể loại (theo DTO UpdateTheLoaiDto)
   * @returns Promise trả về đối tượng thể loại sau khi cập nhật (TheLoai)
   */
  async update(id: number, newData: UpdateTheLoaiDto): Promise<TheLoai> {
    // Tìm bản ghi hiện tại theo id
    const existing = await this.TheLoaiRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(
        'Cập nhật thể loại - Không tìm thấy thể loại'
      );
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { updatePayload } = await this.LichSuThaoTacService.create({
        actionType: 'update',
        staffId: newData.NV_id ?? '',
        dataName: DULIEU.CATEGORY,
        dataId: id,
        newData: newData,
        existingData: existing,
        ignoreFields: ['NV_id'],
        session: session,
      });
      const updated = await this.TheLoaiRepo.update(id, updatePayload, session);
      if (!updated) {
        throw new BadRequestException('Cập nhật thể loại - Cập nhật thất bại');
      }
      await session.commitTransaction();
      return updated;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof Error) throw error;
      throw new InternalServerErrorException(
        `Cập nhật thể loại - ${error.message}`
      );
    } finally {
      await session.endSession();
    }
  }

  /**
   * Lấy danh sách tất cả thể loại sách chưa bị xoá.
   *
   * @returns Promise trả về mảng các thể loại (dưới dạng Partial, chỉ chứa một số trường)
   */
  async findAll(): Promise<Partial<TheLoai>[]> {
    return this.TheLoaiRepo.findAll();
  }

  /**
   * Tìm thể loại theo ID và chưa bị xoá.
   *
   * @param {number} id - ID của thể loại cần tìm
   * @returns {Promise<TheLoai | null>} Promise trả về thể loại nếu tìm thấy, ngược lại null
   */
  async findById(id: number): Promise<any> {
    const result = await this.TheLoaiRepo.findById(id);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  /**
   * Đánh dấu thể loại là đã xoá (soft delete) theo ID.
   *
   * @param {number} id - ID của thể loại cần xoá
   * @param {string} staffId - ID nhân viên thực hiện xoá
   * @returns {Promise<TheLoai>} Promise trả về thể loại đã được cập nhật trạng thái xoá
   */
  async delete(id: number, staffId: string): Promise<TheLoai> {
    const existing = await this.TheLoaiRepo.findById(id);
    if (!existing)
      throw new NotFoundException('Xóa thể loại - Thể loại không tồn tại');
    const hasChild = await this.TheLoaiRepo.findAllChildren(id);
    if (hasChild && hasChild.length > 0) throw new ConflictException();
    const hasProduct = await this.SachService.findInCategories([
      ...hasChild,
      id,
    ]);
    if (hasProduct && hasProduct.length > 0)
      throw new ConflictException(
        'Xóa thể loại - Không thể xóa do ràng buộc dữ liệu'
      );
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const deleted = await this.TheLoaiRepo.delete(id, session);
      if (!deleted) {
        throw new BadRequestException('Xóa thể loại - Xóa thất bại');
      }
      await this.LichSuThaoTacService.create({
        actionType: 'delete',
        staffId: staffId ?? '',
        dataName: DULIEU.CATEGORY,
        dataId: id,
        session: session,
      });
      await session.commitTransaction();
      return deleted;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof Error) throw error;
      throw new InternalServerErrorException(`Xóa thể loại - ${error.message}`);
    } finally {
      await session.endSession();
    }
  }

  /**
   * Đếm tổng số thể loại chưa bị xoá.
   *
   * @returns {Promise<number>} Tổng số thể loại còn hoạt động (chưa xoá)
   */
  async countAll(): Promise<number> {
    return this.TheLoaiRepo.countAll();
  }
}
