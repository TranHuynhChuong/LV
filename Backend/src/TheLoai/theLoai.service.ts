import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TheLoaiRepository } from './theLoai.repository';
import { CreateDto, UpdateDto } from './theLoai.dto';
import { TheLoai } from './theLoai.schema';
import {
  NhanVienInfo,
  NhanVienService,
} from 'src/NguoiDung/NhanVien/nhanVien.service';

@Injectable()
export class TheLoaiService {
  constructor(
    private readonly TheLoai: TheLoaiRepository,
    private readonly NhanVien: NhanVienService
  ) {}

  // Tạo thể loại mới
  async create(data: CreateDto): Promise<TheLoai> {
    const exists = await this.TheLoai.findByName(data.TL_ten);
    if (exists) {
      throw new ConflictException();
    }

    const lastId = await this.TheLoai.findLastId();
    const newId = lastId + 1;

    const created = await this.TheLoai.create({
      ...data,
      TL_id: newId,
      TL_idTL: data.TL_idTL ?? null,
    });

    if (!created) {
      throw new BadRequestException();
    }
    return created;
  }

  async update(id: number, dto: UpdateDto): Promise<TheLoai> {
    if (dto.TL_ten) {
      const exists = await this.TheLoai.findByName(dto.TL_ten);
      if (exists && exists.TL_id !== id) {
        throw new ConflictException();
      }
    }

    const updated = await this.TheLoai.update(id, dto);
    if (!updated) {
      throw new BadRequestException();
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

    let nhanVien: NhanVienInfo = {
      NV_id: result.NV_id,
      NV_hoTen: null,
      NV_email: null,
      NV_soDienThoai: null,
    };

    if (result.NV_id) {
      const staff = await this.NhanVien.findById(result.NV_id);
      if (staff) {
        nhanVien = {
          NV_id: staff.NV_id,
          NV_hoTen: staff.NV_hoTen,
          NV_email: staff.NV_email,
          NV_soDienThoai: staff.NV_soDienThoai,
        };
        result.NV_id = nhanVien;
      }
    }
    return result;
  }
  // Xóa thể loại (cập nhật TL_daXoa = true)
  async delete(id: number): Promise<TheLoai> {
    const deleted = await this.TheLoai.delete(id);
    if (!deleted) {
      throw new BadRequestException();
    }
    return deleted;
  }

  // Đếm tổng số thể loại chưa xóa
  async countAll(): Promise<number> {
    return this.TheLoai.countAll();
  }
}
