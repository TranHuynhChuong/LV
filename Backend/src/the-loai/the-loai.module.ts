import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TheLoaiController } from './the-loai.controller';
import { TheLoaiService, TheLoaiUtilService } from './the-loai.service';
import { TheLoaiRepository } from './repositories/the-loai.repository';
import { TheLoai, TheLoaiSchema } from './schemas/the-loai.schema';
import { SachModule } from 'src/sach/sach.module';
import { LichSuThaoTacModule } from 'src/lich-su-thao-tac/lich-su-thao-tac.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TheLoai.name, schema: TheLoaiSchema }]),
    forwardRef(() => SachModule),
    LichSuThaoTacModule,
  ],
  controllers: [TheLoaiController],
  providers: [TheLoaiService, TheLoaiUtilService, TheLoaiRepository],
  exports: [TheLoaiUtilService],
})
export class TheLoaiModule {}
