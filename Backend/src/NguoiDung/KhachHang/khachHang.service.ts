import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { KhachHangRepository } from './khachHang.repository';
import { CreateDto, UpdateDto } from './khachHang.dto';
import { KhachHang } from './khachHang.schema';
import { calculatePaginate } from 'src/Util/cursor-pagination';

@Injectable()
export class KhachHangsService {
  constructor(private readonly KhachHang: KhachHangRepository) {}

  async create(data: CreateDto): Promise<KhachHang> {
    const existing = await this.KhachHang.findByEmail(data.KH_email);
    if (existing) {
      throw new ConflictException();
    }
    const created = await this.KhachHang.create(data);
    if (!created) {
      throw new BadRequestException();
    }
    return created;
  }

  async findAll(
    mode: 'head' | 'tail' | 'cursor' = 'head',
    cursorId?: string,
    currentPage = 1,
    targetPage = 1,
    limit = 24
  ): Promise<
    | {
        paginate: number[];
        currentPage: number;
        cursorId: string;
        data: any[];
        totalItems: number;
        totalPage: number;
        pages: number[];
      }
    | undefined
  > {
    const totalItems = await this.KhachHang.countAll();
    const totalPage = Math.ceil(totalItems / limit);

    let result: {
      data: any[];
      totalItems: number;
      totalPage: number;
      pages: number[];
    };

    let newCurrentPage = targetPage;

    switch (mode) {
      case 'head': {
        result = await this.KhachHang.findAllHead(limit);
        break;
      }

      case 'tail': {
        result = await this.KhachHang.findAllTail(limit);
        newCurrentPage = totalPage;
        break;
      }

      case 'cursor': {
        const skip = Math.abs(targetPage - currentPage) * limit;

        const direction = targetPage >= currentPage ? 'forward' : 'back';
        if (direction === 'forward') {
          result = await this.KhachHang.findAllForward(
            cursorId ?? '',
            skip,
            limit
          );
        } else {
          result = await this.KhachHang.findAllBack(
            cursorId ?? '',
            skip,
            limit
          );
        }
        break;
      }

      default:
        return;
    }

    const paginate = calculatePaginate(newCurrentPage, totalItems, limit);
    const tmp = result.data[0] as unknown as { _id: string };
    const newCursorId = result.data.length > 0 ? String(tmp._id) : '';

    return {
      data: result.data,
      totalItems: result.totalItems,
      totalPage: result.totalPage,
      paginate,
      currentPage: newCurrentPage,
      cursorId: newCursorId,
      pages: result.pages,
    };
  }

  async update(email: string, data: UpdateDto): Promise<KhachHang> {
    const updated = await this.KhachHang.update(email, data);
    if (!updated) {
      throw new BadRequestException();
    }
    return updated;
  }

  async findByEmail(email: string): Promise<KhachHang> {
    const result = await this.KhachHang.findByEmail(email);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  async updateEmail(email: string, newEmail: string): Promise<KhachHang> {
    const existing = await this.KhachHang.findByEmail(newEmail);
    if (existing) {
      throw new ConflictException();
    }

    const updated = await this.KhachHang.updateEmail(email, newEmail);
    if (!updated) {
      throw new BadRequestException();
    }
    return updated;
  }

  async countAll(): Promise<number> {
    return await this.KhachHang.countAll();
  }

  async countByMonth(year = new Date().getFullYear()): Promise<number[]> {
    return await this.KhachHang.countByMonthInCurrentYear(
      year,
      Array(12).fill(0)
    );
  }
}
