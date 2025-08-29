import { Expose } from 'class-transformer';

export class ResponseTheLoaiDto {
  @Expose({ name: 'TL_ten' })
  name: string;

  @Expose({ name: 'TL_id' })
  categoryId: number;

  @Expose({ name: 'TL_idTL' })
  parentId: number | null;
}
