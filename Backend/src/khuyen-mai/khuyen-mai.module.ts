import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KhuyenMai, KhuyenMaiSchema } from './schemas/khuyen-mai.schema';
import { KhuyenMaiRepository } from './repositories/khuyen-mai.repository';
import { KhuyenMaiService, KhuyenMaiUtilService } from './khuyen-mai.service';
import { KhuyenMaiController } from './khuyen-mai.controller';
import {
  ChiTietKhuyenMai,
  ChiTietKhuyenMaiSchema,
} from './schemas/chi-tiet-khuyen-mai.schema';
import { ChiTietKhuyenMaiRepository } from './repositories/chi-tiet-khuyen-mai.repository';
import { LichSuThaoTacModule } from 'src/lich-su-thao-tac/lich-su-thao-tac.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KhuyenMai.name, schema: KhuyenMaiSchema },
      { name: ChiTietKhuyenMai.name, schema: ChiTietKhuyenMaiSchema },
    ]),
    LichSuThaoTacModule,
  ],
  providers: [
    KhuyenMaiRepository,
    KhuyenMaiService,
    KhuyenMaiUtilService,
    ChiTietKhuyenMaiRepository,
  ],
  controllers: [KhuyenMaiController],
  exports: [KhuyenMaiUtilService],
})
export class KhuyenMaiModule {}
