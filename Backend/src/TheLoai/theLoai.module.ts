import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TheLoaiController } from './theLoai.controller';
import { TheLoaiService, TheLoaiUtilService } from './theLoai.service';
import { TheLoaiRepository } from './theLoai.repository';
import { TheLoai, TheLoaiSchema } from './theLoai.schema';
import { NguoiDungModule } from 'src/NguoiDung/nguoiDung.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TheLoai.name, schema: TheLoaiSchema }]),
    NguoiDungModule,
  ],
  controllers: [TheLoaiController],
  providers: [TheLoaiService, TheLoaiUtilService, TheLoaiRepository],
  exports: [TheLoaiUtilService],
})
export class TheLoaiModule {}
