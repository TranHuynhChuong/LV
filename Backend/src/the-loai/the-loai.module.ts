import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TheLoaiController } from './the-loai.controller';
import { TheLoaiService, TheLoaiUtilService } from './the-loai.service';
import { TheLoaiRepository } from './repositories/the-loai.repository';
import { TheLoai, TheLoaiSchema } from './schemas/the-loai.schema';
import { NguoiDungModule } from 'src/nguoi-dung/nguoi-dung.module';

import { SachModule } from 'src/sach/sach.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TheLoai.name, schema: TheLoaiSchema }]),
    NguoiDungModule,

    forwardRef(() => SachModule),
  ],
  controllers: [TheLoaiController],
  providers: [TheLoaiService, TheLoaiUtilService, TheLoaiRepository],
  exports: [TheLoaiUtilService],
})
export class TheLoaiModule {}
