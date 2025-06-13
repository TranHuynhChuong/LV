// cartStore.ts (đã cập nhật sort)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItemType {
  SP_id: number;
  GH_soLuong: number;
  GH_thoiGian: string; // ISO string
}

interface CartState {
  carts: CartItemType[];
  addToCart: (item: CartItemType) => void;
  removeFromCart: (SP_id: number) => void;

  updateQuantity: (SP_id: number, GH_soLuong: number) => void;
  replaceCart: (items: CartItemType[]) => void;
}

const sortByTimeDesc = (items: CartItemType[]): CartItemType[] =>
  [...items].sort((a, b) => new Date(b.GH_thoiGian).getTime() - new Date(a.GH_thoiGian).getTime());

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: [],

      addToCart: (item) => {
        const now = new Date().toISOString();
        const existing = get().carts.find((c) => c.SP_id === item.SP_id);

        let updatedCarts: CartItemType[];

        if (existing) {
          updatedCarts = get().carts.map((c) =>
            c.SP_id === item.SP_id
              ? {
                  ...c,
                  GH_soLuong: c.GH_soLuong + item.GH_soLuong,
                  GH_thoiGian: now,
                }
              : c
          );
        } else {
          updatedCarts = [...get().carts, { ...item, GH_thoiGian: now }];
        }

        set({ carts: sortByTimeDesc(updatedCarts) });
      },

      updateQuantity: (SP_id, GH_soLuong) => {
        const now = new Date().toISOString();
        const updated = get().carts.map((c) =>
          c.SP_id === SP_id ? { ...c, GH_soLuong, GH_thoiGian: now } : c
        );
        set({ carts: sortByTimeDesc(updated) });
      },

      removeFromCart: (SP_id) => set({ carts: get().carts.filter((c) => c.SP_id !== SP_id) }),

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
