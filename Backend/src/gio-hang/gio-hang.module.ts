import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GioHang, GioHangSchema } from './schemas/gio-hang.schema';
import { GioHangRepository } from './repositories/gio-hang.repository';
import { GioHangService } from './services/gio-hang.service';
import { GioHangController } from './controllers/gio-hang.controller';
import { SachModule } from 'src/sach/sach.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GioHang.name, schema: GioHangSchema }]),
    SachModule,
  ],
  providers: [GioHangRepository, GioHangService],
  controllers: [GioHangController],
  exports: [GioHangService],
})
export class GioHangModule {}
