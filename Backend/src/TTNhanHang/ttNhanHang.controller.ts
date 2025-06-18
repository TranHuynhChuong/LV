import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { TTNhanHangKHService } from './ttNhanHang.service';
import { TTNhanHangKH } from './ttNhanhang.schema';

@Controller('api/addresses')
export class TTNhanHangController {
  constructor(private readonly service: TTNhanHangKHService) {}

  // POST /addresses
  @Post()
  async create(@Body() data: any): Promise<TTNhanHangKH> {
    return this.service.create(data);
  }

  // GET /addresses/:KH_id/:NH_id
  @Get(':KH_id/:NH_id')
  async findOne(
    @Param('NH_id', ParseIntPipe) NH_id: number,
    @Param('KH_id', ParseIntPipe) KH_id: number
  ): Promise<TTNhanHangKH> {
    return this.service.findOne(NH_id, KH_id);
  }

  // GET /addresses/customer/:KH_ids
  @Get('/:KH_id')
  async findAllByKHId(
    @Param('KH_id', ParseIntPipe) KH_id: number
  ): Promise<TTNhanHangKH[]> {
    return this.service.findAllByKHId(KH_id);
  }

  // PUT/addresses/:KH_id/:NH_id
  @Put(':KH_id/:NH_id')
  async update(
    @Param('NH_id', ParseIntPipe) NH_id: number,
    @Param('KH_id', ParseIntPipe) KH_id: number,
    @Body() data: Partial<TTNhanHangKH>
  ): Promise<TTNhanHangKH> {
    return this.service.update(NH_id, KH_id, data);
  }

  // DELETE /addresses/:KH_id/:NH_id
  @Delete(':KH_id/:NH_id')
  async delete(
    @Param('NH_id', ParseIntPipe) NH_id: number,
    @Param('KH_id', ParseIntPipe) KH_id: number
  ) {
    return this.service.delete(NH_id, KH_id);
  }
}
