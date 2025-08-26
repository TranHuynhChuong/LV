import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaGiam, MaGiamSchema } from './schemas/ma-giam.schema';
import { MaGiamRepository } from './repositories/ma-giam.repository';
import { MaGiamService, MaGiamUtilService } from './ma-giam.service';
import { MaGiamController } from './ma-giam.controller';

import {
  MaGiamDonHang,
  MaGiamDonHangSchema,
} from './schemas/ma-giam-don-hang.schema';
import { MaGiamDonHangRepository } from './repositories/ma-giam-don-hang.repository';
import { LichSuThaoTacModule } from 'src/lich-su-thao-tac/lich-su-thao-tac.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MaGiam.name, schema: MaGiamSchema }]),
    MongooseModule.forFeature([
      { name: MaGiamDonHang.name, schema: MaGiamDonHangSchema },
    ]),
    LichSuThaoTacModule,
  ],
  providers: [
    MaGiamRepository,
    MaGiamService,
    MaGiamUtilService,
    MaGiamDonHangRepository,
  ],
  controllers: [MaGiamController],
  exports: [MaGiamUtilService],
})
export class MaGiamModule {}
