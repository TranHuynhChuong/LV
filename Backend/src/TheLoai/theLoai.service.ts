import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TheLoaiRepository } from './theLoai.repository';
import { CreateDto, UpdateDto } from './theLoai.dto';
import { TheLoai } from './theLoai.schema';
import { NhanVienService } from 'src/NguoiDung/NhanVien/nhanVien.service';

const typeOfChange: Record<string, string> = {
  TL_ten: 'Tên thể loại',
  TL_idTL: 'Thể loại cha',
};

@Injectable()
export class TheLoaiService {
  constructor(
    private readonly TheLoai: TheLoaiRepository,
    private readonly NhanVien: NhanVienService
  ) {}

  // Tạo thể loại mới
  async create(newData: CreateDto): Promise<TheLoai> {
    const exists = await this.TheLoai.findByName(newData.TL_ten);
    if (exists) {
      throw new ConflictException();
    }

    const thaoTac = {
      thaoTac: 'Tạo mới',
      NV_id: newData.NV_id,
      thoiGian: new Date(),
    };

    const lastId = await this.TheLoai.findLastId();
    const newId = lastId + 1;

    const created = await this.TheLoai.create({
      ...newData,
      TL_id: newId,
      lichSuThaoTac: [thaoTac],
    });

    if (!created) {
      throw new BadRequestException();
    }
    return created;
  }

  async update(id: number, newData: UpdateDto): Promise<TheLoai> {
    if (!newData.TL_ten) {
      throw new BadRequestException('Tên thể loại không được để trống');
    }

    // Tìm bản ghi hiện tại theo id
    const current = await this.TheLoai.findById(id);
    if (!current) {
      throw new NotFoundException('Không tìm thấy thể loại');
    }

    // Kiểm tra tên trùng (nếu có)
    const sameName = await this.TheLoai.findByName(newData.TL_ten);
    if (sameName && sameName.TL_id !== id) {
      throw new ConflictException('Tên thể loại đã tồn tại');
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
      lichSu.length > 0 ? await this.NhanVien.mapActions(lichSu) : [];

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
