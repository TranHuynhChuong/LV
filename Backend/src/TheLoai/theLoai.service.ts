import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { TheLoaiRepository } from './theLoai.repository';
import { CreateDto, UpdateDto } from './theLoai.dto';
import { TheLoai } from './theLoai.schema';
import { NhanVienUtilService } from 'src/NguoiDung/NhanVien/nhanVien.service';

const typeOfChange: Record<string, string> = {
  TL_ten: 'Tên thể loại',
  TL_idTL: 'Thể loại cha',
};

@Injectable()
export class TheLoaiUtilService {
  constructor(private readonly TheLoai: TheLoaiRepository) {}

  async findAllChildren(id?: number): Promise<number[]> {
    if (!id) return [];
    return this.TheLoai.findAllChildren(id);
  }
}

import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { SanPhamUtilService } from 'src/SanPham/sanPham.service';
@Injectable()
export class TheLoaiService {
  constructor(
    private readonly TheLoai: TheLoaiRepository,
    private readonly NhanVien: NhanVienUtilService,
    @InjectConnection() private readonly connection: Connection,
    @Inject(forwardRef(() => SanPhamUtilService))
    private readonly SanPham: SanPhamUtilService
  ) {}

  // Tạo thể loại mới
  async create(newData: CreateDto): Promise<TheLoai> {
    const session = await this.connection.startSession();

    try {
      let result: TheLoai;

      await session.withTransaction(async () => {
        const thaoTac = {
          thaoTac: 'Tạo mới',
          NV_id: newData.NV_id,
          thoiGian: new Date(),
        };

        const lastId = await this.TheLoai.findLastId(session);
        const newId = lastId + 1;

        const created = await this.TheLoai.create(
          {
            ...newData,
            TL_id: newId,
            lichSuThaoTac: [thaoTac],
          },
          session
        );

        if (!created) {
          throw new BadRequestException();
        }

        result = created;
      });

      return result!;
    } finally {
      await session.endSession(); // Gọi trong finally để đảm bảo luôn end
    }
  }

  async update(id: number, newData: UpdateDto): Promise<TheLoai> {
    // Tìm bản ghi hiện tại theo id
    const current = await this.TheLoai.findById(id);
    if (!current) {
      throw new NotFoundException('Không tìm thấy thể loại');
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

    const updated = await this.TheLoai.update(id, updatePayload);
    if (!updated) {
      throw new BadRequestException('Cập nhật thất bại');
    }

    return updated;
  }

  // Lấy tất cả thể loại cơ bản
  async findAll(): Promise<Partial<TheLoai>[]> {
    return this.TheLoai.findAll();
  }

  async findById(id: number): Promise<any> {
    const result: any = await this.TheLoai.findById(id);
    if (!result) {
      throw new NotFoundException();
    }

    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0 ? await this.NhanVien.mapActivityLog(lichSu) : [];

    return result;
  }
  // Xóa thể loại (cập nhật TL_daXoa = true)
  // async delete(id: number): Promise<TheLoai> {
  //   const deleted = await this.TheLoai.delete(id);
  //   if (!deleted) {
  //     throw new BadRequestException();
  //   }
  //   return deleted;
  // }

  async delete(id: number, NV_id: string): Promise<TheLoai> {
    const existing = await this.TheLoai.findById(id);
    if (!existing) throw new BadRequestException();

    const hasChild = await this.TheLoai.findAllChildren(id);
    if (hasChild && hasChild.length > 0) throw new ConflictException();

    const hasProduct = await this.SanPham.findInCategories([...hasChild, id]);
    if (hasProduct && hasProduct.length > 0) throw new ConflictException();
    console.log(hasProduct);
    const thaoTac = {
      thaoTac: 'Xóa dữ liệu',
      NV_id: NV_id,
      thoiGian: new Date(),
    };

    const lichSuThaoTac = [...existing.lichSuThaoTac, thaoTac];

    const deleted = await this.TheLoai.update(id, {
      TL_daXoa: true,
      lichSuThaoTac: lichSuThaoTac,
    });
    if (!deleted) {
      throw new NotFoundException();
    }
    return deleted;
  }

  // Đếm tổng số thể loại chưa xóa
  async countAll(): Promise<number> {
    return this.TheLoai.countAll();
  }
}
