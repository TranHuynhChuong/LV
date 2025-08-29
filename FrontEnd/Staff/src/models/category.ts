export type Category = {
  name: string;
  categoryId?: number | null;
  parent?: string;
  parentId?: number | null;
  childrenCount?: number;
  level?: number;
};
