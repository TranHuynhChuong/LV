import { Category, CategoryDto } from '.';

export function mapCategoryToDto(data: Category, staffId: string) {
  return {
    TL_ten: data.name,
    TL_idTL: data.parentId ?? null,
    NV_id: staffId,
  };
}

export function mapCategoryFromDto(data: CategoryDto) {
  return {
    name: data.TL_ten,
    parentId: data.TL_idTL ?? null,
  };
}
