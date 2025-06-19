import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaGiam, MaGiamSchema } from './maGiam.schema';
import { MaGiamRepository } from './maGiam.repository';
import { MaGiamService, MaGiamUtilService } from './maGiam.service';
import { MaGiamController } from './maGiam.controller';
import { NguoiDungModule } from 'src/NguoiDung/nguoiDung.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MaGiam.name, schema: MaGiamSchema }]),
    NguoiDungModule,
  ],
  providers: [MaGiamRepository, MaGiamService, MaGiamUtilService],
  controllers: [MaGiamController],
  exports: [MaGiamUtilService],
})
export class MaGiamModule {}
