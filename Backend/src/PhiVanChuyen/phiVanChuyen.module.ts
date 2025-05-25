import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PhiVanChuyenController } from './phiVanChuyen.controller';
import { PhiVanChuyenService } from './phiVanChuyen.service';
import { PhiVanChuyenRepository } from './phiVanChuyen.repository';
import { PhiVanChuyen, PhiVanChuyenSchema } from './phiVanChuyen.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PhiVanChuyen.name, schema: PhiVanChuyenSchema },
    ]),
  ],
  controllers: [PhiVanChuyenController],
  providers: [PhiVanChuyenService, PhiVanChuyenRepository],
  exports: [PhiVanChuyenService],
})
export class PhiVanChuyenModule {}
