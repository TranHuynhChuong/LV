import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { CustomersService } from './Customers/customer.service';
import { CustomersRepository } from './Customers/customer.repository';
import { KHACH_HANG, KHACH_HANGSchema } from './Customers/customers.schema';
import { StaffsService } from './Staffs/staffs.service';
import { StaffsRepository } from './Staffs/staffs.repository';
import { NHAN_VIEN, NHAN_VIENSchema } from './Staffs/staffs.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KHACH_HANG.name, schema: KHACH_HANGSchema },
    ]),
    MongooseModule.forFeature([
      { name: NHAN_VIEN.name, schema: NHAN_VIENSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    CustomersService,
    CustomersRepository,
    StaffsService,
    StaffsRepository,
  ],
  exports: [CustomersService, StaffsService],
})
export class UsersModule {}
