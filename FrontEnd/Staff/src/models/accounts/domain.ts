export type Customer = {
  email: string;
  name: string;
  createAt: string;
  status: number;
};

export type Staff = {
  email: string;
  role: string;
  fullName: string;
  phone: string;
  id?: string;
  password: string;
};
