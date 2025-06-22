import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderProduct = {
  productId: number;
  salePrice: number;
  price: number;
  cost: number;
  quantity: number;
  cover: string;
  name: string;
  weight: number;
};

type OrderState = {
  products: OrderProduct[];
  addProduct: (product: OrderProduct) => void;
  clearOrder: () => void;
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (product) => {
        const existing = get().products.find((p) => p.productId === product.productId);
        if (existing) {
          set({
            products: get().products.map((p) =>
              p.productId === product.productId
                ? { ...p, quantity: p.quantity + product.quantity }
                : p
            ),
          });
        } else {
          set({ products: [...get().products, product] });
        }
      },
      clearOrder: () =>
        set({
          products: [],
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
