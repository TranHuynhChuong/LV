import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SanPhamController } from './sanPham.controller';
import { SanPhamService } from './sanPham.service';
import { SanPhamRepository } from './sanPham.repository';
import { SanPham, SanPhamSchema } from './sanPham.schema';
import { KhuyenMaiModule } from 'src/KhuyenMai/khuyenMai.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SanPham.name, schema: SanPhamSchema }]),
    KhuyenMaiModule,
  ],
  controllers: [SanPhamController],
  providers: [SanPhamService, SanPhamRepository],
  exports: [SanPhamService],
})
export class SanPhamModule {}
