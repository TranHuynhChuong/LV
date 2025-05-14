import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './controller';
import { CustomerService } from './Customer/customer.service';
import { CustomerRepository } from './Customer/customer.repository';
import { KHACH_HANG, KHACH_HANGSchema } from './Customer/customer.schema';
import { StaffService } from './Staff/staff.service';
import { StaffRepository } from './Staff/staff.repository';
import { NHAN_VIEN, NHAN_VIENSchema } from './Staff/staff.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KHACH_HANG.name, schema: KHACH_HANGSchema },
    ]),
    MongooseModule.forFeature([
      { name: NHAN_VIEN.name, schema: NHAN_VIENSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [
    CustomerService,
    CustomerRepository,
    StaffService,
    StaffRepository,
  ],
})
export class UserModule {}
