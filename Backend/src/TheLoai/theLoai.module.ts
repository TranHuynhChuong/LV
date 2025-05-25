import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TheLoaiController } from './theLoai.controller';
import { TheLoaiService } from './theLoai.service';
import { TheLoaiRepository } from './theLoai.repository';
import { TheLoai, TheLoaiSchema } from './theLoai.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TheLoai.name, schema: TheLoaiSchema }]),
  ],
  controllers: [TheLoaiController],
  providers: [TheLoaiService, TheLoaiRepository],
  exports: [TheLoaiService],
})
export class TheLoaiModule {}
