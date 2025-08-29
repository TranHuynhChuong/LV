import { Module } from '@nestjs/common';
import { DiaChiController } from './controllers/dia-chi.controller';
import { DiaChiService } from './services/dia-chi.service';
import { DiaChiRepository } from './repositories/dia-chi.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { TinhThanh, TinhThanhSchema } from './schemas/dia-chi.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TinhThanh.name, schema: TinhThanhSchema },
    ]),
  ],
  controllers: [DiaChiController],
  providers: [DiaChiService, DiaChiRepository],
  exports: [DiaChiService],
})
export class DiaChiModule {}
