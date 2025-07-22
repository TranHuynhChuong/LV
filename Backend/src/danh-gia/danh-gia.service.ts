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

            const newScore = await this.DanhGiaRepo.getAverageRatingOfProduct(
              dto.SP_id,
              session
            );
            await this.SanPhamService.updateScore(dto.SP_id, newScore, session);

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

  async findAll(option: {
    page: number;
    limit: number;
    rating?: number;
    from?: Date;
    to?: Date;
    status?: 'all' | 'visible' | 'hidden';
  }): Promise<any> {
    const { page, limit = 24, rating, from, to, status } = option;
    const result: any = await this.DanhGiaRepo.findAll(
      page,
      limit,
      rating,
      from,
      to,
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

  async show(dto: UpdateDanhGiaDto): Promise<DanhGia> {
    const session = await this.connection.startSession();
    let updated: DanhGia | null = null;

    try {
      await session.withTransaction(async () => {
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

        const updateResult = await this.DanhGiaRepo.update(
          dto.DG_id,
          dto.SP_id,
          dto.KH_id,
          false,
          thaoTac,
          session
        );

        if (!updateResult) {
          throw new BadRequestException(
            'Cập nhật đánh giá - Hiển thị thất bại'
          );
        }
        updated = updateResult;

        const newScore = await this.DanhGiaRepo.getAverageRatingOfProduct(
          dto.SP_id,
          session
        );
        await this.SanPhamService.updateScore(dto.SP_id, newScore, session);
      });

      if (!updated) {
        throw new BadRequestException('Cập nhật đánh giá - Không thể cập nhật');
      }
      return updated;
    } finally {
      await session.endSession();
    }
  }

  async hide(dto: UpdateDanhGiaDto): Promise<DanhGia> {
    const session = await this.connection.startSession();
    let updated: DanhGia | null = null;

    try {
      await session.withTransaction(async () => {
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

        const updateResult = await this.DanhGiaRepo.update(
          dto.DG_id,
          dto.SP_id,
          dto.KH_id,
          true,
          thaoTac,
          session
        );

        if (!updated) {
          throw new BadRequestException('Cập nhật đánh giá - Ẩn thất bại');
        }

        updated = updateResult;

        const newScore = await this.DanhGiaRepo.getAverageRatingOfProduct(
          dto.SP_id,
          session
        );
        await this.SanPhamService.updateScore(dto.SP_id, newScore, session);
      });

      if (!updated) {
        throw new BadRequestException('Cập nhật đánh giá - Không thể cập nhật');
      }
      return updated;
    } finally {
      await session.endSession();
    }
  }

  async countRating(from: Date, to: Date) {
    return this.DanhGiaRepo.countRating(from, to);
  }
}
