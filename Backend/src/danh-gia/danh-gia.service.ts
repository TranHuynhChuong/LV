import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDanhGiaDto } from './dto/create-danh-gia.dto';
import { DanhGiaRepository } from './repositories/danh-gia.repository';
import { UpdateDanhGiaDto } from './dto/update-danh-gia.dto';
import { SanPhamUtilService } from 'src/san-pham/san-pham.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { DanhGia } from './schemas/danh-gia.schema';
import { NhanVienUtilService } from 'src/nguoi-dung/nhan-vien/nhan-vien.service';

@Injectable()
export class DanhGiaService {
  constructor(
    @InjectConnection() private readonly connection: Connection,

    private readonly DanhGiaRepo: DanhGiaRepository,
    private readonly SanPhamService: SanPhamUtilService,
    private readonly NhanVienService: NhanVienUtilService
  ) {}

  async create(dtos: CreateDanhGiaDto[]): Promise<DanhGia[]> {
    const session = await this.connection.startSession();

    try {
      const result = await session.withTransaction(
        async (): Promise<DanhGia[]> => {
          const createdDanhGias: DanhGia[] = [];

          for (const dto of dtos) {
            const created = await this.DanhGiaRepo.create(dto, session);
            if (!created) {
              throw new BadRequestException('Tạo đánh giá - Tạo thất bại');
            }

            // Sau khi tạo thành công thì cập nhật điểm trung bình
            await this.DanhGiaRepo.getAverageRatingOfProduct(
              dto.SP_id,
              session
            );
            await this.SanPhamService.updateScore(
              dto.SP_id,
              dto.DG_diem,
              session
            );

            createdDanhGias.push(created);
          }

          return createdDanhGias;
        }
      );

      if (!result || result.length === 0) {
        throw new BadRequestException(
          'Tạo đánh giá - Không có đánh giá nào được tạo'
        );
      }

      return result;
    } finally {
      await session.endSession();
    }
  }

  async findAllOfProduct(spId: number, page: number, limit = 24) {
    return this.DanhGiaRepo.findAllOfProduct(spId, page, limit);
  }

  async findAll(
    page: number,
    limit = 24,
    rating?: number,
    date?: Date,
    status?: 'all' | 'visible' | 'hidden'
  ): Promise<any> {
    const result: any = await this.DanhGiaRepo.findAll(
      page,
      limit,
      rating,
      date,
      status
    );

    for (const item of result.data) {
      const lichSu = item.lichSuThaoTac ?? [];
      item.lichSuThaoTac =
        lichSu.length > 0
          ? await this.NhanVienService.mapActivityLog(lichSu)
          : [];
    }

    return result;
  }

  async show(dto: UpdateDanhGiaDto) {
    const current = await this.DanhGiaRepo.findOne(
      dto.DG_id,
      dto.SP_id,
      dto.KH_id
    );
    if (!current) {
      throw new NotFoundException(
        'Cập nhật đánh giá - Không tìm thấy đánh giá'
      );
    }

    const thaoTac = {
      thaoTac: 'Hiển thị đánh giá',
      NV_id: dto.NV_id,
      thoiGian: new Date(),
    };

    const updated = await this.DanhGiaRepo.update(
      dto.DG_id,
      dto.SP_id,
      dto.KH_id,
      false,
      thaoTac
    );

    if (!updated) {
      throw new BadRequestException('Cập nhật đánh giá - Hiển thị thất bại');
    }

    return updated;
  }

  async hide(dto: UpdateDanhGiaDto) {
    const current = await this.DanhGiaRepo.findOne(
      dto.DG_id,
      dto.SP_id,
      dto.KH_id
    );
    if (!current) {
      throw new NotFoundException(
        'Cập nhật đánh giá - Không tìm thấy đánh giá'
      );
    }

    const thaoTac = {
      thaoTac: 'Ẩn đánh giá',
      NV_id: dto.NV_id,
      thoiGian: new Date(),
    };

    const updated = await this.DanhGiaRepo.update(
      dto.DG_id,
      dto.SP_id,
      dto.KH_id,
      true,
      thaoTac
    );

    if (!updated) {
      throw new BadRequestException('Cập nhật đánh giá - Ẩn thị thất bại');
    }

    return updated;
  }

  async countRatingOfMonth(year: number, month: number) {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    return this.DanhGiaRepo.countRatingOfMonth(startDate, endDate);
  }

  async countRatingOfYear(year: number) {
    const startDate = new Date(Date.UTC(year, 0, 1)); // 1/1
    const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)); // 31/12
    return this.DanhGiaRepo.countRatingOfMonth(startDate, endDate);
  }
}
