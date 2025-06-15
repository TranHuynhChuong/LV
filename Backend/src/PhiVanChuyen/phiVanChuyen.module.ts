import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PhiVanChuyenController } from './phiVanChuyen.controller';
import { PhiVanChuyenService } from './phiVanChuyen.service';
import { PhiVanChuyenRepository } from './phiVanChuyen.repository';
import { PhiVanChuyen, PhiVanChuyenSchema } from './phiVanChuyen.schema';
import { NguoiDungModule } from 'src/NguoiDung/nguoiDung.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PhiVanChuyen.name, schema: PhiVanChuyenSchema },
    ]),
    NguoiDungModule,
  ],
  controllers: [PhiVanChuyenController],
  providers: [PhiVanChuyenService, PhiVanChuyenRepository],
  exports: [PhiVanChuyenService],
})
export class PhiVanChuyenModule {}
