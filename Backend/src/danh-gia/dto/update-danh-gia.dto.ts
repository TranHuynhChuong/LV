import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateDanhGiaDto {
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'staffId' })
  NV_id: string;

  @IsNumber()
  @Expose({ name: 'bookId' })
  S_id: number;

  @IsString()
  @Expose({ name: 'orderId' })
  DH_id: string;

  @IsNumber()
  @Expose({ name: 'customerId' })
  KH_id: number;
}
