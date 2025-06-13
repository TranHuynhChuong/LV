import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GioHang, GioHangSchema } from './gioHang.schema';
import { GioHangRepository } from './gioHang.repository';
import { GioHangService } from './gioHang.service';
import { GioHangController } from './gioHang.controller';
import { SanPhamModule } from 'src/SanPham/sanPham.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GioHang.name, schema: GioHangSchema }]),
    SanPhamModule,
  ],
  providers: [GioHangRepository, GioHangService],
  controllers: [GioHangController],
  exports: [GioHangService],
})
export class GioHangModule {}
