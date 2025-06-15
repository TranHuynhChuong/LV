import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NguoiDungController } from './nguoiDung.controller';
import { KhachHangsService } from './KhachHang/khachHang.service';
import { KhachHangRepository } from './KhachHang/khachHang.repository';
import { KhachHang, KhachHangSchema } from './KhachHang/khachHang.schema';
import {
  NhanVienService,
  NhanVienUtilsService,
} from './NhanVien/nhanVien.service';
import { NhanVienRepository } from './NhanVien/nhanVien.repository';
import { NhanVien, NhanVienSchema } from './NhanVien/nhanVien.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KhachHang.name, schema: KhachHangSchema },
    ]),
    MongooseModule.forFeature([
      { name: NhanVien.name, schema: NhanVienSchema },
    ]),
  ],
  controllers: [NguoiDungController],
  providers: [
    KhachHangsService,
    KhachHangRepository,
    NhanVienService,
    NhanVienUtilsService,
    NhanVienRepository,
  ],
  exports: [KhachHangsService, NhanVienUtilsService],
})
export class NguoiDungModule {}
