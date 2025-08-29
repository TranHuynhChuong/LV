import { forwardRef, Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LichSuThaoTacService } from './services/lich-su-thao-tac.service';
import {
  LichSuThaoTac,
  LichSuThaoTacSchema,
} from './schemas/lich-su-thao-tac.schema';
import { LichSuThaoTacRepository } from './repositories/lich-su-thao-tac.repository';
import { LichSuThaoTacController } from './controllers/lich-su-thao-tac.controller';
import { NguoiDungModule } from 'src/nguoi-dung/nguoi-dung.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LichSuThaoTac.name, schema: LichSuThaoTacSchema },
    ]),
    forwardRef(() => NguoiDungModule),
  ],
  controllers: [LichSuThaoTacController],
  providers: [LichSuThaoTacService, LichSuThaoTacRepository],
  exports: [LichSuThaoTacService],
})
export class LichSuThaoTacModule {}
