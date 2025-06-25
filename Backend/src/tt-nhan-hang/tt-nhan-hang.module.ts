import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TTNhanHangController } from './tt-nhan-hang.controller';
import {
  TTNhanHangDHService,
  TTNhanHangKHService,
} from './tt-nhan-hang.service';
import { TTNhanHangRepository } from './repositories/tt-nhan-hang-dh.repository';
import {
  TTNhanHangDH,
  TTNhanHangDHSchema,
  TTNhanHangKH,
  TTNhanHangKHSchema,
} from './schemas/tt-nhan-hang-kh.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TTNhanHangKH.name, schema: TTNhanHangKHSchema },
    ]),
    MongooseModule.forFeature([
      { name: TTNhanHangDH.name, schema: TTNhanHangDHSchema },
    ]),
  ],
  controllers: [TTNhanHangController],
  providers: [TTNhanHangKHService, TTNhanHangRepository, TTNhanHangDHService],
  exports: [TTNhanHangDHService],
})
export class TTNhanHangModule {}
