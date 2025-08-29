import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  KhachHangService,
  KhachHangUtilService,
} from './khach-hang/services/khach-hang.service';
import { KhachHangRepository } from './khach-hang/repositories/khach-hang.repository';
import {
  KhachHang,
  KhachHangSchema,
} from './khach-hang/schemas/khach-hang.schema';
import { NguoiDungController } from './controllers/nguoi-dung.controller';
import {
  NhanVienService,
  NhanVienUtilService,
} from './nhan-vien/services/nhan-vien.service';
import { NhanVienRepository } from './nhan-vien/repositories/nhan-vien.repository';
import { NhanVien, NhanVienSchema } from './nhan-vien/schemas/nhan-vien.schema';
import { LichSuThaoTacModule } from 'src/lich-su-thao-tac/lich-su-thao-tac.module';
import { KhachHangController } from './khach-hang/controllers/khach-hang.controller';
import { NhanVienController } from './nhan-vien/controllers/nhan-vien.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KhachHang.name, schema: KhachHangSchema },
      { name: NhanVien.name, schema: NhanVienSchema },
    ]),
    forwardRef(() => LichSuThaoTacModule),
  ],
  controllers: [NguoiDungController, KhachHangController, NhanVienController],
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
