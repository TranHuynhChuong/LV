import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NguoiDungController } from './nguoiDung.controller';
import { KhachHangService } from './KhachHang/khachHang.service';
import { KhachHangRepository } from './KhachHang/khachHang.repository';
import { KhachHang, KhachHangSchema } from './KhachHang/khachHang.schema';
import {
  NhanVienService,
  NhanVienUtilService,
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
    KhachHangService,
    KhachHangRepository,
    NhanVienService,
    NhanVienUtilService,
    NhanVienRepository,
  ],
  exports: [KhachHangService, NhanVienUtilService],
})
export class NguoiDungModule {}
