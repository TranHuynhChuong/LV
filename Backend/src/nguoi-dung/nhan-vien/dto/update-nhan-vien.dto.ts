import { PartialType } from '@nestjs/mapped-types';
import { CreateNhanVienDto } from './create-nhan-vien.dto';

export class UpdateNhanVienDto extends PartialType(CreateNhanVienDto) {}
