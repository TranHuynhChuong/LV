import { Module } from '@nestjs/common';
import { DiaChiController } from './dia-chi.controller';
import { DiaChiService } from './dia-chi.service';
import { DiaChiRepository } from './dia-chi.repository';

@Module({
  controllers: [DiaChiController],
  providers: [DiaChiService, DiaChiRepository],
  exports: [DiaChiService],
})
export class DiaChiModule {}
