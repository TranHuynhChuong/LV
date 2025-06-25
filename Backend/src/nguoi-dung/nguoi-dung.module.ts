import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NguoiDungController } from './nguoi-dung.controller';
import {
  KhachHangService,
  KhachHangUtilService,
} from './khach-hang/khach-hang.service';

import {
  NhanVienService,
  NhanVienUtilService,
} from './nhan-vien/nhan-vien.service';
import { NhanVienRepository } from './nhan-vien/repositories/nhan-vien.repository';
import { NhanVien, NhanVienSchema } from './nhan-vien/schemas/nhan-vien.schema';
import { KhachHangRepository } from './khach-hang/repositories/khach-hang.repository';
import {
  KhachHang,
  KhachHangSchema,
} from './khach-hang/schemas/khach-hang.schema';

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
    KhachHangUtilService,
    KhachHangRepository,
    NhanVienService,
    NhanVienUtilService,
    NhanVienRepository,
  ],
  exports: [KhachHangService, NhanVienUtilService, KhachHangUtilService],
})
export class NguoiDungModule {}
