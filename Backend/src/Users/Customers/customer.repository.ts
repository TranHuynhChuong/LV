import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KHACH_HANG, KHACH_HANGDocument } from './customers.schema';
import { CreateCustomerDto, UpdateCustomerDto } from './customers.dto';

@Injectable()
export class CustomersRepository {
  constructor(
    @InjectModel(KHACH_HANG.name)
    private readonly Customer: Model<KHACH_HANGDocument>
  ) {}

  async create(newCustomer: CreateCustomerDto): Promise<KHACH_HANG> {
    const created = new this.Customer(newCustomer);
    return created.save();
  }

  async findAll(page: number, limit: number): Promise<KHACH_HANG[]> {
    const start = page * limit;
    return this.Customer.find().skip(start).limit(limit).exec();
  }

  async findByEmail(email: string): Promise<KHACH_HANG | null> {
    return this.Customer.findOne({ KH_email: email }).exec();
  }

  async update(
    email: string,
    updateDto: UpdateCustomerDto
  ): Promise<KHACH_HANG | null> {
    return this.Customer.findOneAndUpdate({ KH_email: email }, updateDto, {
      new: true,
    }).exec();
  }

  async delete(email: string): Promise<KHACH_HANG | null> {
    return this.Customer.findOneAndUpdate({ KH_email: email }).exec();
  }

  async countAll(): Promise<number> {
    return this.Customer.countDocuments().exec();
  }

  async countByMonthInCurrentYear(
    year: number,
    countsByMonth: number[]
  ): Promise<number[]> {
    const result = await this.Customer.aggregate([
      {
        $match: {
          KH_ngayTao: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$KH_ngayTao' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    result.forEach((item) => {
      countsByMonth[item.month - 1] = item.count;
    });

    return countsByMonth;
  }
}
