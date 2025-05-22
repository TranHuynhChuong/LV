// khach-hang.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomersRepository } from './customer.repository';
import { CreateCustomerDto, UpdateCustomerDto } from './customers.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly CustomerRepository: CustomersRepository) {}

  /** Tạo mới khách hàng */
  async create(newCustomer: CreateCustomerDto) {
    // Kiểm tra xem email đã tồn tại chưa
    const existingCustomer = await this.CustomerRepository.findByEmail(
      newCustomer.KH_email
    );
    if (existingCustomer) {
      throw new NotFoundException('Email chưa được đăng ký tài khoản');
    }
    return this.CustomerRepository.create(newCustomer);
  }

  /** Lấy danh sách tất cả khách hàng - phân trang*/
  async findAll(page: number = 0, limit: number = 24) {
    const result = {};

    result['customers'] = await this.CustomerRepository.findAll(page, limit);
    result['total'] = await this.CustomerRepository.countAll();

    return result;
  }

  /** Cập nhật khách hàng **/
  async update(email: string, updateCustomer: UpdateCustomerDto) {
    const customer = await this.CustomerRepository.update(
      email,
      updateCustomer
    );
    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng ');
    }
    return customer;
  }

  /** Tìm theo email **/
  async findByEmail(email: string) {
    const customer = await this.CustomerRepository.findByEmail(email);
    if (!customer) {
      throw new NotFoundException('Email chưa được đăng ký tài khoản');
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
