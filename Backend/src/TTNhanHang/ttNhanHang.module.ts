import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TTNhanHangController } from './ttNhanHang.controller';
import { TTNhanHangKHService } from './ttNhanHang.service';
import { TTNhanHangRepository } from './ttNhanHang.repository';
import { TTNhanHangKH, TTNhanHangKHSchema } from './ttNhanhang.schema';

@Module({
  controllers: [TTNhanHangController],
  providers: [TTNhanHangKHService, TTNhanHangRepository],
  imports: [
    MongooseModule.forFeature([
      { name: TTNhanHangKH.name, schema: TTNhanHangKHSchema },
    ]),
  ],
})
export class TTNhanHangModule {}
