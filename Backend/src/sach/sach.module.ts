import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SachController } from './sach.controller';
import { SachService, SachUtilService } from './sach.service';
import { SachRepository } from './repositories/sach.repository';
import { Sach, SachSchema } from './schemas/sach.schema';
import { TheLoaiModule } from 'src/the-loai/the-loai.module';
import { KhuyenMaiModule } from 'src/khuyen-mai/khuyen-mai.module';
import { LichSuThaoTacModule } from 'src/lich-su-thao-tac/lich-su-thao-tac.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sach.name, schema: SachSchema }]),
    forwardRef(() => TheLoaiModule),
    KhuyenMaiModule,
    LichSuThaoTacModule,
  ],
  controllers: [SachController],
  providers: [SachService, SachUtilService, SachRepository],
  exports: [SachUtilService],
})
export class SachModule {}
