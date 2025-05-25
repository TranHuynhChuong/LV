import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './nguoiDung.controller';
import { KhachHangsService } from './KhachHang/khachHang.service';
import { KhachHangRepository } from './KhachHang/khachHang.repository';
import { KhachHang, KhachHangSchema } from './KhachHang/khachHang.schema';
import { NhanVienService } from './NhanVien/nhanVien.service';
import { NhanVienRepository } from './NhanVien/nhanVien.repository';
import { NhanVien, NhanVienSchema } from './NhanVien/nhanVien.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KhachHang.name, schema: KhachHangSchema },
    ]),
    MongooseModule.forFeature([
      { name: NhanVien.name, schema: NhanVienSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    KhachHangsService,
    KhachHangRepository,
    NhanVienService,
    NhanVienRepository,
  ],
  exports: [KhachHangsService, NhanVienService],
})
export class UsersModule {}
