'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cart.store';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axiosClient';
import { Checkbox } from '@/components/ui/checkbox';
import CartItem, { ProductInCart } from './components/CartItem';

export default function CartPage() {
  const { authData } = useAuth();
  const localCarts = useCartStore((state) => state.carts);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const replaceCart = useCartStore((state) => state.replaceCart);

  const [products, setProducts] = useState<ProductInCart[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const fetchCartProducts = async () => {
      setLoading(true);
      try {
        if (!authData.userId) {
          const res = await api.post<ProductInCart[]>('/carts/get-carts', localCarts);
          const validProducts = res.data.filter(Boolean);
          setProducts(validProducts);
          setSelected(validProducts.map((item) => item.SP_id));
          replaceCart(
            validProducts.map((p) => ({
              SP_id: p.SP_id,
              GH_soLuong: p.GH_soLuong,
              GH_thoiGian: new Date(p.GH_thoiGian).toISOString(),
            }))
          );
        } else {
        }
      } catch (error) {
        console.error('Lỗi lấy giỏ hàng:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartProducts();
  }, [authData.userId, hydrated]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((spid) => spid !== id) : [...prev, id]));
  };

  const handleQuantityChange = async (id: number, value: string) => {
    const quantity = Math.max(1, Number(value) || 1);
    const product = products.find((p) => p.SP_id === id);
    if (!product) return;

    if (!authData?.userId) {
      try {
        const response = await api.post<ProductInCart[]>('/carts/get-carts', [
          { SP_id: id, GH_soLuong: quantity },
        ]);
        const updated = response.data[0] ?? null;

        if (!updated) {
          // ❌ Nếu không còn hợp lệ => xóa
          removeFromCart(id);
          setProducts((prev) => prev.filter((p) => p.SP_id !== id));
          setSelected((prev) => prev.filter((spid) => spid !== id));
        } else {
          // ✅ Nếu hợp lệ => cập nhật lại local store và UI
          updateQuantity(id, updated.GH_soLuong);
          setProducts((prev) => prev.map((p) => (p.SP_id === id ? updated : p)));
        }
      } catch (error) {
        // Xử lý lỗi khi cập nhật số lượng
        console.error('Lỗi cập nhật số lượng:', error);
        alert('Có lỗi xảy ra khi cập nhật số lượng sản phẩm.');
      }
    }
  };

  const handleRemove = (id: number) => {
    if (!authData?.userId) {
      removeFromCart(id);
      setProducts((prev) => prev.filter((p) => p.SP_id !== id));
      setSelected((prev) => prev.filter((spid) => spid !== id));
    } else {
      // TODO: gọi API xóa nếu user đăng nhập
    }
  };

  //   const total = products.reduce((sum, p) => {
  //     if (!selected.includes(p.SP_id)) return sum;
  //     return sum + p.SP_giaGiam * p.GH_soLuong;
  //   }, 0);

  if (loading) return <div>Đang tải...</div>;
  if (!products.length) return <div>Giỏ hàng trống.</div>;

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-xl font-bold">Giỏ hàng</h1>
      <div className="flex items-center justify-between border p-3 rounded bg-zinc-50 shadow">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selected.length === products.length}
            onCheckedChange={() => {
              if (selected.length === products.length) {
                setSelected([]);
              } else {
                setSelected(products.map((p) => p.SP_id));
              }
            }}
          />
          <span className="text-sm text-zinc-700">
            Đã chọn {selected.length}/{products.length} sản phẩm
          </span>
        </div>
      </div>
      {products.map((p) => (
        <CartItem
          key={p.SP_id}
          product={p}
          isSelected={selected.includes(p.SP_id)}
          onToggle={() => toggleSelect(p.SP_id)}
          onQuantityChange={handleQuantityChange}
          onRemove={handleRemove}
        />
      ))}
    </div>
  );
}
