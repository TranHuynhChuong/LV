import { PartialType } from '@nestjs/mapped-types';
import { CreateKhachHangDto } from './create-khach-hang.dto';

export class UpdateKhachHangDto extends PartialType(CreateKhachHangDto) {}
