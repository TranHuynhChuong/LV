import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShippingFeeController } from './shippingFee.controller';
import { ShippingFeeService } from './shippingFee.service';
import { ShippingFeeRepository } from './shippingFee.repository';
import { PHI_VAN_CHUYEN, PHI_VAN_CHUYENSchema } from './shippingFee.schema';
import { AuthModule } from 'src/Auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PHI_VAN_CHUYEN.name, schema: PHI_VAN_CHUYENSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [ShippingFeeController],
  providers: [ShippingFeeService, ShippingFeeRepository],
  exports: [ShippingFeeService],
})
export class ShippingFeeModule {}
