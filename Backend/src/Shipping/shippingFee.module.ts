import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShippingFeeController } from './shippingFee.controller';
import { ShippingFeeService } from './shippingFee.service';
import { ShippingFeeRepository } from './shippingFee.repository';
import { PhiVanChuyen, PhiVanChuyenSchema } from './shippingFee.schema';
import { AuthModule } from 'src/Auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PhiVanChuyen.name, schema: PhiVanChuyenSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [ShippingFeeController],
  providers: [ShippingFeeService, ShippingFeeRepository],
  exports: [ShippingFeeService],
})
export class ShippingFeeModule {}
