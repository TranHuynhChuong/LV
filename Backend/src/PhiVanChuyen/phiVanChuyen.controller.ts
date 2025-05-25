import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { PhiVanChuyenService } from './phiVanChuyen.service';
import { CreateDto, UpdateDto } from './phiVanChuyen.dto';

@Controller('api/shipping')
export class PhiVanChuyenController {
  constructor(private readonly PhiVanChuyen: PhiVanChuyenService) {}

  @Get('addressFiles')
  getAllShipmentJson() {
    const data = this.PhiVanChuyen.loadAddressFiles();
    return {
      data,
      message: 'Lấy danh sách địa chỉ thành công',
    };
  }

  @Post()
  async create(@Body() data: CreateDto) {
    await this.PhiVanChuyen.createShippingFee(data);
    return {
      message: 'Tạo phí vận chuyển thành công',
    };
  }

  @Get('all')
  async findAll() {
    const results = await this.PhiVanChuyen.getAllShippingFee();
    return {
      data: results,
      message: 'Lấy danh sách phí vận chuyển thành công',
    };
  }

  @Get()
  async findAllBasic() {
    const results = await this.PhiVanChuyen.getAllShippingFeeBasic();
    return {
      data: results,
      message: 'Lấy danh sách phí vận chuyển thành công',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const data = await this.PhiVanChuyen.getShippingFeeById(id);
    return {
      data,
      message: 'Lấy phí vận chuyển thành công',
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateDto) {
    await this.PhiVanChuyen.updateShippingFee(id, data);
    return {
      message: 'Cập nhật phí vận chuyển thành công',
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.PhiVanChuyen.deleteShippingFee(id);
    return {
      message: 'Xóa phí vận chuyển thành công',
    };
  }
}
