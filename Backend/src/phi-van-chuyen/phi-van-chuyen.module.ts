import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PhiVanChuyenController } from './phi-van-chuyen.controller';
import { PhiVanChuyenService } from './phi-van-chuyen.service';
import { PhiVanChuyenRepository } from './repositories/phi-van-chuyen.repository';
import {
  PhiVanChuyen,
  PhiVanChuyenSchema,
} from './schemas/phi-van-chuyen.schema';
import { DiaChiModule } from 'src/dia-chi/dia-chi.module';
import { LichSuThaoTacModule } from 'src/lich-su-thao-tac/lich-su-thao-tac.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PhiVanChuyen.name, schema: PhiVanChuyenSchema },
    ]),
    DiaChiModule,
    LichSuThaoTacModule,
  ],
  controllers: [PhiVanChuyenController],
  providers: [PhiVanChuyenService, PhiVanChuyenRepository],
  exports: [PhiVanChuyenService],
})
export class PhiVanChuyenModule {}
