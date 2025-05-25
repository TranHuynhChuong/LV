import {
  Injectable,
  NotFoundException,
  ConflictException,
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
      throw new ConflictException('Tên thể loại đã tồn tại');
    }

    const lastId = await this.TheLoai.findLastId();
    const newId = lastId + 1;

    const created = await this.TheLoai.create({
      ...data,
      TL_id: newId,
      TL_idTL: data.TL_idTL ?? null,
    });

    if (!created) {
      throw new ConflictException('Tạo thể loại thất bại');
    }
    return created;
  }

  async update(id: number, dto: UpdateDto): Promise<TheLoai> {
    if (dto.TL_ten) {
      const exists = await this.TheLoai.findByName(dto.TL_ten);
      if (exists && exists.TL_id !== id) {
        throw new ConflictException('Tên thể loại đã tồn tại');
      }
    }

    const updated = await this.TheLoai.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Không tìm thấy thể loại');
    }
    return updated;
  }

  // Lấy tất cả thể loại chi tiết
  async findAll(): Promise<TheLoai[]> {
    return this.TheLoai.findAll();
  }

  // Lấy tất cả thể loại cơ bản
  async findAllBasic(): Promise<Partial<TheLoai>[]> {
    return this.TheLoai.findAllBasic();
  }

  // Xóa thể loại (cập nhật TL_daXoa = true)
  async delete(id: number): Promise<TheLoai> {
    const deleted = await this.TheLoai.delete(id);
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy thể loại');
    }
    return deleted;
  }

  // Đếm tổng số thể loại chưa xóa
  async countAll(): Promise<number> {
    return this.TheLoai.countAll();
  }
}
