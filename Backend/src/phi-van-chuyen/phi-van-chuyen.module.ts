import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PhiVanChuyenController } from './phi-van-chuyen.controller';
import { PhiVanChuyenService } from './phi-van-chuyen.service';
import { PhiVanChuyenRepository } from './repositories/phi-van-chuyen.repository';
import {
  PhiVanChuyen,
  PhiVanChuyenSchema,
} from './schemas/phi-van-chuyen.schema';
import { NguoiDungModule } from 'src/nguoi-dung/nguoi-dung.module';
import { DiaChiModule } from 'src/dia-chi/dia-chi.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PhiVanChuyen.name, schema: PhiVanChuyenSchema },
    ]),
    NguoiDungModule,
    DiaChiModule,
  ],
  controllers: [PhiVanChuyenController],
  providers: [PhiVanChuyenService, PhiVanChuyenRepository],
  exports: [PhiVanChuyenService],
})
export class PhiVanChuyenModule {}
