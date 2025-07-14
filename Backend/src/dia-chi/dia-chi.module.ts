import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiaChiController } from './dia-chi.controller';
import { DiaChiService } from './dia-chi.service';
import { DiaChiRepository } from './dia-chi.repository';
import { DiaChi, DiaChiSchema } from './schemas/dia-chi.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DiaChi.name, schema: DiaChiSchema }]),
  ],
  controllers: [DiaChiController],
  providers: [DiaChiService, DiaChiRepository],
  exports: [DiaChiService],
})
export class DiaChiModule {}
