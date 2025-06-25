import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { TheLoaiRepository } from './repositories/the-loai.repository';
import { TheLoai } from './schemas/the-loai.schema';
import { NhanVienUtilService } from 'src/nguoi-dung/nhan-vien/nhan-vien.service';

const typeOfChange: Record<string, string> = {
  TL_ten: 'Tên thể loại',
  TL_idTL: 'Thể loại cha',
};

@Injectable()
export class TheLoaiUtilService {
  constructor(private readonly TheLoaiRepo: TheLoaiRepository) {}

  async findAllChildren(id?: number): Promise<number[]> {
    if (!id) return [];
    return this.TheLoaiRepo.findAllChildren(id);
  }
}

import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { SanPhamUtilService } from 'src/san-pham/san-pham.service';
import { CreateTheLoaiDto } from './dto/create-the-loai.dto';
import { UpdateTheLoaiDto } from './dto/update-th-loai.dto';
@Injectable()
export class TheLoaiService {
  constructor(
    private readonly TheLoaiRepo: TheLoaiRepository,
    private readonly NhanVienService: NhanVienUtilService,
    @InjectConnection() private readonly connection: Connection,
    @Inject(forwardRef(() => SanPhamUtilService))
    private readonly SanPhamService: SanPhamUtilService
  ) {}

  // Tạo thể loại mới
  async create(newData: CreateTheLoaiDto): Promise<TheLoai> {
    const session = await this.connection.startSession();

    try {
      let result: TheLoai;

      await session.withTransaction(async () => {
        const thaoTac = {
          thaoTac: 'Tạo mới',
          NV_id: newData.NV_id,
          thoiGian: new Date(),
        };

        const lastId = await this.TheLoaiRepo.findLastId(session);
        const newId = lastId + 1;

        const created = await this.TheLoaiRepo.create(
          {
            ...newData,
            TL_id: newId,
            lichSuThaoTac: [thaoTac],
          },
          session
        );

        if (!created) {
          throw new BadRequestException('Tạo thể loại - Tạo thất bại');
        }

        result = created;
      });

      return result!;
    } finally {
      await session.endSession(); // Gọi trong finally để đảm bảo luôn end
    }
  }

  async update(id: number, newData: UpdateTheLoaiDto): Promise<TheLoai> {
    // Tìm bản ghi hiện tại theo id
    const current = await this.TheLoaiRepo.findById(id);
    if (!current) {
      throw new NotFoundException(
        'Cập nhật thể loại - Không tìm thấy thể loại'
      );
    }

    // Xác định trường thay đổi
    const fieldsChange: string[] = [];
    const updatePayload: any = {};

    for (const key of Object.keys(newData)) {
      if (
        newData[key] !== undefined &&
        newData[key] !== current[key] &&
        key !== 'NV_id'
      ) {
        const label = typeOfChange[key] || key;
        fieldsChange.push(label);
        updatePayload[key] = newData[key];
      }
    }

    // Thêm lịch sử thao tác nếu có thay đổi
    if (fieldsChange.length > 0 && newData.NV_id) {
      const thaoTac = {
        thaoTac: `Cập nhật: ${fieldsChange.join(', ')}`,
        NV_id: newData.NV_id,
        thoiGian: new Date(),
      };
      updatePayload.lichSuThaoTac = [...current.lichSuThaoTac, thaoTac];
    }

    // Không có thay đổi thì trả về bản ghi cũ
    if (Object.keys(updatePayload).length === 0) {
      return current;
    }

    const updated = await this.TheLoaiRepo.update(id, updatePayload);
    if (!updated) {
      throw new BadRequestException('Cập nhật thể loại - Cập nhật thất bại');
    }

    return updated;
  }

  // Lấy tất cả thể loại cơ bản
  async findAll(): Promise<Partial<TheLoai>[]> {
    return this.TheLoaiRepo.findAll();
  }

  async findById(id: number): Promise<any> {
    const result: any = await this.TheLoaiRepo.findById(id);
    if (!result) {
      throw new NotFoundException();
    }

    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0
        ? await this.NhanVienService.mapActivityLog(lichSu)
        : [];

    return result;
  }

  async delete(id: number, NV_id: string): Promise<TheLoai> {
    const existing = await this.TheLoaiRepo.findById(id);
    if (!existing)
      throw new NotFoundException('Xóa thể loại - Thể loại không tồn tại');

    const hasChild = await this.TheLoaiRepo.findAllChildren(id);
    if (hasChild && hasChild.length > 0) throw new ConflictException();

    const hasProduct = await this.SanPhamService.findInCategories([
      ...hasChild,
      id,
    ]);
    if (hasProduct && hasProduct.length > 0)
      throw new ConflictException(
        'Xóa thể loại - Không thể xóa do ràng buộc dữ liệu'
      );

    const thaoTac = {
      thaoTac: 'Xóa dữ liệu',
      NV_id: NV_id,
      thoiGian: new Date(),
    };

    const lichSuThaoTac = [...existing.lichSuThaoTac, thaoTac];

    const deleted = await this.TheLoaiRepo.update(id, {
      TL_daXoa: true,
      lichSuThaoTac: lichSuThaoTac,
    });
    if (!deleted) {
      throw new BadRequestException('Xóa thể loại - Xóa thất bại');
    }
    return deleted;
  }

  // Đếm tổng số thể loại chưa xóa
  async countAll(): Promise<number> {
    return this.TheLoaiRepo.countAll();
  }
}
