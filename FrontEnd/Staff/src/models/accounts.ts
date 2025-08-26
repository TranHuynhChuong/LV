export type Customer = {
  email: string;
  name: string;
  createAt: Date;
};

export type Staff = {
  email: string;
  role: number;
  roleName?: string;
  fullName: string;
  phone: string;
  id?: string;
  password: string;
  isBlock: boolean;
};
