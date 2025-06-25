import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SanPhamController } from './san-pham.controller';
import { SanPhamService, SanPhamUtilService } from './san-pham.service';
import { SanPhamRepository } from './repositories/san-pham.repository';
import { SanPham, SanPhamSchema } from './schemas/san-pham.schema';
import { TheLoaiModule } from 'src/the-loai/the-loai.module';
import { NguoiDungModule } from 'src/nguoi-dung/nguoi-dung.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SanPham.name, schema: SanPhamSchema }]),
    forwardRef(() => TheLoaiModule),
    NguoiDungModule,
  ],
  controllers: [SanPhamController],
  providers: [SanPhamService, SanPhamUtilService, SanPhamRepository],
  exports: [SanPhamUtilService],
})
export class SanPhamModule {}
