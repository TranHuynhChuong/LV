import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { CustomersService } from './Customers/customer.service';
import { CustomersRepository } from './Customers/customer.repository';
import { KhachHang, KhachHangSchema } from './Customers/customers.schema';
import { StaffsService } from './Staffs/staffs.service';
import { StaffsRepository } from './Staffs/staffs.repository';
import { NhanVien, NhanVienSchema } from './Staffs/staffs.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KhachHang.name, schema: KhachHangSchema },
    ]),
    MongooseModule.forFeature([
      { name: NhanVien.name, schema: NhanVienSchema },
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
