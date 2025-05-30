import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TheLoaiRepository } from './theLoai.repository';
import { CreateDto, UpdateDto } from './theLoai.dto';
import { TheLoai, LichSuThaoTacTL } from './theLoai.schema';
import {
  NhanVienService,
  ThaoTac,
} from 'src/NguoiDung/NhanVien/nhanVien.service';

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
      throw new BadRequestException();
    }
    const existing = await this.TheLoai.findByName(newData.TL_ten);
    if (existing && existing.TL_id !== id) {
      throw new ConflictException();
    }

    if (!existing) {
      throw new BadRequestException();
    }

    const fieldsChange: string[] = [];
    for (const key of Object.keys(newData)) {
      if (newData[key] !== undefined && newData[key] !== existing[key]) {
        const label = typeOfChange[key] || key;
        fieldsChange.push(label);
      }
    }

    const newLichSuThaoTac = [...existing.lichSuThaoTac];
    if (fieldsChange.length > 0 && newData.NV_id) {
      const thaoTac = {
        thaoTac: `Cập nhật: ${fieldsChange.join(', ')}`,
        NV_id: newData.NV_id,
        thoiGian: new Date(),
      };
      newLichSuThaoTac.push(thaoTac);
    }

    const updateObject = {
      ...newData,
      lichSuThaoTac: newLichSuThaoTac,
    };

    const updated = await this.TheLoai.update(id, updateObject);
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

    if (Array.isArray(result.lichSuThaoTacNV)) {
      result.lichSuThaoTac = await Promise.all(
        result.lichSuThaoTac.map(
          async (element: LichSuThaoTacTL): Promise<ThaoTac> => {
            const nhanVien = await this.NhanVien.findById(element.NV_id);
            const thaoTac: ThaoTac = {
              thaoTac: element.thaoTac,
              thoiGian: element.thoiGian,
              nhanVien: {
                NV_id: null,
                NV_hoTen: null,
                NV_email: null,
                NV_soDienThoai: null,
              },
            };
            if (nhanVien) {
              result.nhanVien = {
                NV_id: nhanVien.NV_id,
                NV_hoTen: nhanVien.NV_hoTen,
                NV_email: nhanVien.NV_email,
                NV_soDienThoai: nhanVien.NV_soDienThoai,
              };
            }
            return thaoTac;
          }
        )
      );
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
