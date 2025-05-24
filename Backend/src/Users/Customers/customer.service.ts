import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CustomersRepository } from './customer.repository';
import { CreateCustomerDto, UpdateCustomerDto } from './customers.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly customerRepository: CustomersRepository) {}

  async create(newCustomer: CreateCustomerDto) {
    const existingCustomer = await this.customerRepository.findByEmail(
      newCustomer.KH_email
    );
    if (existingCustomer) {
      throw new ConflictException('Email đã được đăng ký tài khoản');
    }
    const created = await this.customerRepository.create(newCustomer);
    if (!created) {
      throw new ConflictException('Tạo khách hàng thất bại');
    }
    return created;
  }

  async findAll(page = 0, limit = 24) {
    page = page < 0 ? 0 : page;
    limit = limit <= 0 ? 24 : limit;

    const customers = await this.customerRepository.findAll(page, limit);
    const total = await this.customerRepository.countAll();

    return { customers, total };
  }

  async update(email: string, updateCustomer: UpdateCustomerDto) {
    const updated = await this.customerRepository.update(email, updateCustomer);
    if (!updated) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }
    return updated;
  }

  async findByEmail(email: string) {
    const customer = await this.customerRepository.findByEmail(email);
    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng với email này');
    }
    return customer;
  }

  async updateEmail(email: string, newEmail: string) {
    const existing = await this.customerRepository.findByEmail(newEmail);
    if (existing) {
      throw new ConflictException('Email mới đã được đăng ký');
    }

    const updated = await this.customerRepository.updateEmail(email, newEmail);
    if (!updated) {
      throw new NotFoundException(
        'Không tìm thấy khách hàng để cập nhật email'
      );
    }
    return updated;
  }

  async countAll() {
    return await this.customerRepository.countAll();
  }

  async countByMonth(year = new Date().getFullYear()) {
    return await this.customerRepository.countByMonthInCurrentYear(
      year,
      Array(12).fill(0)
    );
  }
}
