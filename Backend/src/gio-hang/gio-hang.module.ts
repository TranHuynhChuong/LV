import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GioHang, GioHangSchema } from './schemas/gioHang.schema';
import { GioHangRepository } from './repositories/gio-hang.repository';
import { GioHangService } from './gio-hang.service';
import { GioHangController } from './gio-hang.controller';
import { SanPhamModule } from 'src/san-pham/san-pham.module';

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
