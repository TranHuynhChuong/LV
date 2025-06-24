import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TTNhanHangController } from './ttNhanHang.controller';
import { TTNhanHangDHService, TTNhanHangKHService } from './ttNhanHang.service';
import { TTNhanHangRepository } from './repositories/ttNhanHangDH.repository';
import {
  TTNhanHangDH,
  TTNhanHangDHSchema,
  TTNhanHangKH,
  TTNhanHangKHSchema,
} from './schemas/ttNhanhangKH.schema';

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
