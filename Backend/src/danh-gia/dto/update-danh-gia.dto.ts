import { PartialType } from '@nestjs/mapped-types';
import { CreateDanhGiaDto } from './create-danh-gia.dto';

export class UpdateDanhGiaDto extends PartialType(CreateDanhGiaDto) {}
