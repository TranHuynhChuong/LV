import { Injectable } from '@nestjs/common';
import { CreateDanhGiaDto } from './dto/create-danh-gia.dto';
import { UpdateDanhGiaDto } from './dto/update-danh-gia.dto';

@Injectable()
export class DanhGiaService {
  create(createDanhGiaDto: CreateDanhGiaDto) {
    return 'This action adds a new danhGia';
  }

  findAll() {
    return `This action returns all danhGia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} danhGia`;
  }

  update(id: number, updateDanhGiaDto: UpdateDanhGiaDto) {
    return `This action updates a #${id} danhGia`;
  }

  remove(id: number) {
    return `This action removes a #${id} danhGia`;
  }
}
