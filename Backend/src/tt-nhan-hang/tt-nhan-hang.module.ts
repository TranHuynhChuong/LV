import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TTNhanHangController } from './tt-nhan-hang.controller';
import {
  TTNhanHangDHService,
  TTNhanHangKHService,
} from './tt-nhan-hang.service';
import {
  TTNhanHangDH,
  TTNhanHangDHSchema,
} from './schemas/tt-nhan-hang-dh.schema';
import {
  TTNhanHangKH,
  TTNhanHangKHSchema,
} from './schemas/tt-nhan-hang-kh.schema';
import { TTNhanHangKHRepository } from './repositories/tt-nhan-hang-kh.repository';
import { TTNhanHangDHRepository } from './repositories/tt-nhan-hang-dh.repository';
import { DiaChiModule } from 'src/dia-chi/dia-chi.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TTNhanHangKH.name, schema: TTNhanHangKHSchema },
    ]),
    MongooseModule.forFeature([
      { name: TTNhanHangDH.name, schema: TTNhanHangDHSchema },
    ]),
    DiaChiModule,
  ],
  controllers: [TTNhanHangController],
  providers: [
    TTNhanHangKHService,
    TTNhanHangKHRepository,
    TTNhanHangDHService,
    TTNhanHangDHRepository,
  ],
  exports: [TTNhanHangDHService],
})
export class TTNhanHangModule {}
