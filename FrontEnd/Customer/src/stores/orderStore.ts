import { Cart } from '@/models/cart';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type OrderState = {
  orders: Cart[];
  addOrder: (cart: Cart) => void;
  clearOrder: () => void;
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (order) => {
        const existing = get().orders.find((o) => o.bookId === order.bookId);
        if (existing) {
          set({
            orders: get().orders.map((o) =>
              o.bookId === order.bookId ? { ...o, quantity: o.quantity + order.quantity } : o
            ),
          });
        } else {
          set({ orders: [...get().orders, order] });
        }
      },
      clearOrder: () =>
        set({
          orders: [],
        }),
    }),
    {
      name: 'order-storage',
      storage:
        typeof window !== 'undefined'
          ? {
              getItem: (name) => {
                const item = sessionStorage.getItem(name);
                return item ? JSON.parse(item) : null;
              },
              setItem: (name, value) => {
                sessionStorage.setItem(name, JSON.stringify(value));
              },
              removeItem: (name) => sessionStorage.removeItem(name),
            }
          : undefined, // tránh lỗi SSR
    }
  )
);
