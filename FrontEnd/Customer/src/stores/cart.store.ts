import { CartItem } from '@/models/carts';
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
        const existing = get().carts.find((c) => c.productId === item.productId);

        let updatedCarts: CartItem[];

        if (existing) {
          updatedCarts = get().carts.map((c) =>
            c.productId === item.productId
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

      updateQuantity: (productId, quantity) => {
        const now = new Date().toISOString();
        const updated = get().carts.map((c) =>
          c.productId === productId ? { ...c, quantity, dateTime: now } : c
        );
        set({ carts: sortByTimeDesc(updated) });
      },

      removeFromCart: (productId) =>
        set({ carts: get().carts.filter((c) => c.productId !== productId) }),

      removeFromCartByIds: (productIds: number[]) =>
        set({
          carts: get().carts.filter((c) => !productIds.includes(c.productId)),
        }),

      replaceCart: (items: CartItem[]) =>
        set(() => ({
          carts: items, // Ghi đè, đảm bảo cũ mất hoàn toàn
        })),
    }),
    {
      name: 'cart-storage',
    }
  )
);
