import { Cart } from '@/models/carts';
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
        const existing = get().orders.find((p) => p.productId === order.productId);
        if (existing) {
          set({
            orders: get().orders.map((p) =>
              p.productId === order.productId ? { ...p, quantity: p.quantity + order.quantity } : p
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
