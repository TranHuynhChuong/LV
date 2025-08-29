import { Expose } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDanhGiaDto {
  @Expose({ name: 'rating' })
  @IsNumber()
  DG_diem: number;

  @IsOptional()
  @IsString()
  @Expose({ name: 'content' })
  DG_noiDung?: string;

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
