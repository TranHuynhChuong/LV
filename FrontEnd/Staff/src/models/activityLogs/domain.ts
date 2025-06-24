export type ActivityLogs = {
  time: string;
  action: string;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
};
