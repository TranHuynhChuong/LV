export type Address = {
  id?: number;
  orderId?: string;
  name: string;
  phone: string;
  province: {
    id: number;
    name?: string;
  };
  ward: {
    id: number;
    name?: string;
  };
  note?: string;
  userId?: number;
  default?: boolean;
};
