'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cart.store';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axiosClient';
import { Checkbox } from '@/components/ui/checkbox';
import CartItem, { ProductInCart } from './components/cartItem';
import { emitCartChange } from '@/lib/cartEvents';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

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

          replaceCart(
            validProducts.map((p) => ({
              SP_id: p.SP_id,
              GH_soLuong: p.GH_soLuong,
              GH_thoiGian: new Date(p.GH_thoiGian).toISOString(),
            }))
          );
        } else {
          const res = await api.get(`/carts/${authData.userId}`);
          const validProducts = res.data.filter(Boolean);
          setProducts(validProducts);
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
          removeFromCart(id);
          setProducts((prev) => prev.filter((p) => p.SP_id !== id));
          setSelected((prev) => prev.filter((spid) => spid !== id));
        } else {
          updateQuantity(id, updated.GH_soLuong);
          setProducts((prev) => prev.map((p) => (p.SP_id === id ? updated : p)));
        }
      } catch (error) {
        console.error('Lỗi cập nhật số lượng:', error);
      }
    } else {
      try {
        const response = await api.put<ProductInCart[]>('/carts', {
          KH_email: authData.userId,
          SP_id: id,
          GH_soLuong: quantity,
        });

        emitCartChange();

        const updated = response.data[0] ?? null;

        if (!updated) {
          setProducts((prev) => prev.filter((p) => p.SP_id !== id));
          setSelected((prev) => prev.filter((spid) => spid !== id));
        } else {
          updateQuantity(id, updated.GH_soLuong);
          setProducts((prev) => prev.map((p) => (p.SP_id === id ? updated : p)));
        }
      } catch (error) {
        console.error('Lỗi cập nhật số lượng:', error);
      }
    }
  };

  const handleRemove = async (id: number) => {
    if (!authData?.userId) {
      removeFromCart(id);
      setProducts((prev) => prev.filter((p) => p.SP_id !== id));
      setSelected((prev) => prev.filter((spid) => spid !== id));
    } else {
      try {
        await api.delete<ProductInCart[]>('/carts', {
          params: { KH_email: authData.userId, SP_id: id },
        });

        emitCartChange();

        setProducts((prev) => prev.filter((p) => p.SP_id !== id));
        setSelected((prev) => prev.filter((spid) => spid !== id));
      } catch (error) {
        console.error('Lỗi cập nhật số lượng:', error);
      }
    }
  };

  const handleCheckout = () => {
    //const selectedItems = products.filter((p) => selected.includes(p.SP_id));
    // Gửi selectedItems đến trang thanh toán
  };

  if (loading) return <div>Đang tải...</div>;
  if (!products.length) return <div>Giỏ hàng trống.</div>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Giỏ hàng</h1>

      <div className="flex gap-4">
        {/* LEFT: Sản phẩm */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between p-3 rounded bg-zinc-50 shadow">
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

        <div
          className={clsx(
            'flex justify-between items-center bg-white shadow px-4 py-3 border-t',
            'lg:static lg:border-none  lg:p-4 lg:rounded-md lg:flex-col lg:items-start lg:h-fit lg:gap-4 lg:w-fit',
            'fixed bottom-0 left-0 right-0 z-30'
          )}
        >
          <div className="text-sm flex flex-col lg:flex-row lg:w-full justify-between items-center text-zinc-600">
            <span>Tổng tiền :</span>
            <span className="font-semibold text-lg text-red-500">
              {selected
                .reduce((sum, id) => {
                  const product = products.find((p) => p.SP_id === id);
                  return sum + (product?.SP_giaGiam || 0) * (product?.GH_soLuong || 1);
                }, 0)
                .toLocaleString()}
              ₫
            </span>
          </div>

          <Button
            className="rounded-md md:rounded-sm px-6 py-2 lg:px-20 lg:py-4"
            disabled={selected.length === 0}
            onClick={handleCheckout}
          >
            Thanh toán ({selected.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
