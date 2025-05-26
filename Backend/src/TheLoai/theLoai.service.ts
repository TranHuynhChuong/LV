import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { TheLoaiRepository } from './theLoai.repository';
import { CreateDto, UpdateDto } from './theLoai.dto';
import { TheLoai } from './theLoai.schema';

@Injectable()
export class TheLoaiService {
  constructor(private readonly TheLoai: TheLoaiRepository) {}

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
