import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaGiam, MaGiamSchema } from './schemas/ma-giam.schema';
import { MaGiamRepository } from './repositories/ma-giam.repository';
import { MaGiamService, MaGiamUtilService } from './ma-giam.service';
import { MaGiamController } from './ma-giam.controller';
import { NguoiDungModule } from 'src/nguoi-dung/nguoi-dung.module';

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
