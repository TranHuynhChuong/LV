import { CartItem } from '@/models/cart';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  carts: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  removeFromCartByIds: (id: number[]) => void;
  updateQuantity: (id: number, quantity: number) => void;
  replaceCart: (items: CartItem[]) => void;
}

const sortByTimeDesc = (items: CartItem[]): CartItem[] =>
  [...items].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: [],

      addToCart: (item) => {
        const now = new Date().toISOString();
        const existing = get().carts.find((c) => c.id === item.id);

        let updatedCarts: CartItem[];

        if (existing) {
          updatedCarts = get().carts.map((c) =>
            c.id === item.id
              ? {
                  ...c,
                  quantity: c.quantity + item.quantity,
                  dateTime: now,
                }
              : c
          );
        } else {
          updatedCarts = [...get().carts, { ...item, dateTime: now }];
        }

        set({ carts: sortByTimeDesc(updatedCarts) });
      },

      updateQuantity: (id, quantity) => {
        const now = new Date().toISOString();
        const updated = get().carts.map((c) =>
          c.id === id ? { ...c, quantity, dateTime: now } : c
        );
        set({ carts: sortByTimeDesc(updated) });
      },

      removeFromCart: (id) => set({ carts: get().carts.filter((c) => c.id !== id) }),

      removeFromCartByIds: (ids: number[]) =>
        set({
          carts: get().carts.filter((c) => !ids.includes(c.id)),
        }),

      replaceCart: (items: CartItem[]) =>
        set(() => ({
          carts: items,
        })),
    }),
    {
      name: 'cart-storage',
    }
  )
);
