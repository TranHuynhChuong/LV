// cartStore.ts (đã cập nhật sort)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GioHangItem {
  SP_id: number;
  GH_soLuong: number;
  GH_thoiGian: string;
}

export interface CartItemType {
  productId: number;
  quantity: number;
  dateTime: string;
}

interface CartState {
  carts: CartItemType[];
  addToCart: (item: CartItemType) => void;
  removeFromCart: (SP_id: number) => void;
  removeFromCartByIds: (SP_id: number[]) => void;
  updateQuantity: (SP_id: number, GH_soLuong: number) => void;
  replaceCart: (items: CartItemType[]) => void;
}

const sortByTimeDesc = (items: CartItemType[]): CartItemType[] =>
  [...items].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: [],

      addToCart: (item) => {
        const now = new Date().toISOString();
        const existing = get().carts.find((c) => c.productId === item.productId);

        let updatedCarts: CartItemType[];

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

      replaceCart: (items: CartItemType[]) =>
        set(() => ({
          carts: items, // Ghi đè, đảm bảo cũ mất hoàn toàn
        })),
    }),
    {
      name: 'cart-storage',
    }
  )
);
