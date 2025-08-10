import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThanhToan, ThanhToanSchema } from './schemas/thanh-toan.schema';
import { ThanhToanRepository } from './repositories/thanh-toan.repository';
import { ZaloPayService } from './services/zalo-pay.service';
import { ZaloPayController } from './controllers/zalo-pay.controller';
import { ThanhToanService } from './services/thanh-toan.service';
import { ThanhToanController } from './controllers/thanh-toan.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ThanhToan.name, schema: ThanhToanSchema },
    ]),
  ],
  controllers: [ZaloPayController, ThanhToanController],
  providers: [ZaloPayService, ThanhToanService, ThanhToanRepository],
  exports: [ZaloPayService, ThanhToanService],
})
export class ThanhToanModule {}
