import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  KhuyenMai,
  KhuyenMaiSchema,
  ChiTietKhuyenMai,
  ChiTietKhuyenMaiSchema,
} from './khuyenMai.schema';
import { KhuyenMaiRepository } from './khuyenMai.repository';
import { KhuyenMaiService } from './khuyenMai.service';
import { KhuyenMaiController } from './khuyenMai.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KhuyenMai.name, schema: KhuyenMaiSchema },
      { name: ChiTietKhuyenMai.name, schema: ChiTietKhuyenMaiSchema },
    ]),
  ],
  providers: [KhuyenMaiRepository, KhuyenMaiService],
  controllers: [KhuyenMaiController],
  exports: [KhuyenMaiService],
})
export class KhuyenMaiModule {}
