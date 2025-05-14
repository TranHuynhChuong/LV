// khach-hang.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomerRepository } from './customer.repository';
import { CreateCustomerDto, UpdateCustomerDto } from './customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly CustomerRepository: CustomerRepository) {}

  /** Tạo mới khách hàng */
  async create(newCustomer: CreateCustomerDto) {
    return this.CustomerRepository.create(newCustomer);
  }

  /** Lấy danh sách tất cả khách hàng - phân trang*/
  async findAll(page: number = 0, limit: number = 24) {
    const result = {};

    result['customer'] = await this.CustomerRepository.findAll(page, limit);
    result['total'] = await this.CustomerRepository.countAll();

    return result;
  }

  /** Lấy 1 khách hàng theo ID */
  async findOne(id: string) {
    const customer = await this.CustomerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(`Không tìm thấy khách hàng với id ${id}`);
    }
    return customer;
  }

  /** Cập nhật khách hàng **/
  async update(id: string, updateCustomer: UpdateCustomerDto) {
    const customer = await this.CustomerRepository.update(id, updateCustomer);
    if (!customer) {
      throw new NotFoundException(`Không tìm thấy khách hàng với id ${id}`);
    }
    return customer;
  }

  /**** Thống kê  ******/
  /* Số lượng tất cả tài khoản khách hàng đã đăng ký thành viên */
  async countAll() {
    return await this.CustomerRepository.countAll();
  }

  /* Số lượng khách hàng đã đăng ký thành viên theo tháng */
  async countByMonth(year: number = 0) {
    if (year === 0) {
      year = new Date().getFullYear();
    }

    const countsByMonth =
      await this.CustomerRepository.countByMonthInCurrentYear(
        year,
        Array(12).fill(0)
      );

    return countsByMonth;
  }
}
