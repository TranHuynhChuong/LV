import { PartialType } from '@nestjs/mapped-types';
import { CreateTTNhanHangDto } from './create-tt-nhan-hang.dto';

export class UpdateTTNhanHangDto extends PartialType(CreateTTNhanHangDto) {}
