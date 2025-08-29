import { Optional } from '@nestjs/common';
import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateGioHangDto {
  @IsNumber()
  @Optional()
  @Expose({ name: 'customerId' })
  KH_id: number;

  @IsNumber()
  @Expose({ name: 'bookId' })
  S_id: number;

  @IsNumber()
  @Expose({ name: 'quantity' })
  GH_soLuong: number;
}
