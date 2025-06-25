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

@Injectable()
export class DanhGiaService {
  constructor(
    @InjectConnection() private readonly connection: Connection,

    private readonly DanhGiaRepo: DanhGiaRepository,
    private readonly SanPhamService: SanPhamUtilService
  ) {}

  async create(dto: CreateDanhGiaDto) {
    const session = await this.connection.startSession();
    try {
      const created = await session.withTransaction(async () => {
        const created = await this.DanhGiaRepo.create(dto, session);
        if (!created) {
          throw new BadRequestException('Tạo đánh giá - Tạo thất bại');
        }
        const newScore = await this.DanhGiaRepo.getAverageRatingOfProduct(
          dto.SP_id,
          session
        );
        await this.SanPhamService.updateScore(dto.SP_id, newScore, session);
        return created;
      });

      if (!created) {
        throw new BadRequestException('Tạo đánh giá - Tạo thất bại');
      }
      return created;
    } catch (error) {
      throw new error(error);
    } finally {
      await session.endSession();
    }
  }

  async getById(id: string) {
    const result = await this.DanhGiaRepo.findById(id);
    if (!result) {
      throw new NotFoundException('Tìm đánh giá - Đánh giá không tồn tại');
    }
    return result;
  }

  async getAllByProduct(spId: number, page: number, limit = 24) {
    return this.DanhGiaRepo.findAllOfProduct(spId, page, limit);
  }

  async hide(id: string, dto: UpdateDanhGiaDto) {
    const current = await this.DanhGiaRepo.findById(id);
    if (!current) {
      throw new NotFoundException(
        'Cập nhật đánh giá - Không tìm thấy đánh giá'
      );
    }

    const thaoTac = {
      thaoTac: 'Cập nhật: Ẩn đánh giá',
      NV_id: dto.NV_id,
      thoiGian: new Date(),
    };

    const updated = await this.DanhGiaRepo.update(id, {
      DG_daAn: true,
      lichSuThaoTac: [...(current.lichSuThaoTac || []), thaoTac],
    });

    if (!updated) {
      throw new BadRequestException('Cập nhật đánh giá - Ẩn thất bại');
    }

    return updated;
  }

  async show(id: string, dto: UpdateDanhGiaDto) {
    const current = await this.DanhGiaRepo.findById(id);
    if (!current) {
      throw new NotFoundException(
        'Cập nhật đánh giá - Không tìm thấy đánh giá'
      );
    }

    const thaoTac = {
      thaoTac: 'Cập nhật: Hiển thị đánh giá',
      NV_id: dto.NV_id,
      thoiGian: new Date(),
    };

    const updated = await this.DanhGiaRepo.update(id, {
      DG_daAn: false,
      lichSuThaoTac: [...(current.lichSuThaoTac || []), thaoTac],
    });

    if (!updated) {
      throw new BadRequestException('Cập nhật đánh giá - Hiển thị thất bại');
    }

    return updated;
  }
}
