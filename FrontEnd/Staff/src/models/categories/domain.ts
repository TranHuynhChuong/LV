export type Category = {
  name: string;
  id?: number | null;
  parent?: string;
  parentId?: number | null;
  childrenCount?: number;
  level?: number;
};
