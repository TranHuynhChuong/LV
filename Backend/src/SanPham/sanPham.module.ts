import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SanPhamController } from './sanPham.controller';
import { SanPhamService, SanPhamUtilService } from './sanPham.service';
import { SanPhamRepository } from './sanPham.repository';
import { SanPham, SanPhamSchema } from './sanPham.schema';
import { KhuyenMaiModule } from 'src/KhuyenMai/khuyenMai.module';
import { TheLoaiModule } from 'src/TheLoai/theLoai.module';
import { NguoiDungModule } from 'src/NguoiDung/nguoiDung.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SanPham.name, schema: SanPhamSchema }]),
    KhuyenMaiModule,
    TheLoaiModule,
    NguoiDungModule,
  ],
  controllers: [SanPhamController],
  providers: [SanPhamService, SanPhamUtilService, SanPhamRepository],
  exports: [SanPhamUtilService],
})
export class SanPhamModule {}
