'use client';

import CartItem from '@/components/cart/cart-item';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import { emitCartChange } from '@/lib/cart-events';
import { Cart, mapCartFronDto, mapCartToDto } from '@/models/cart';
import { useCartStore } from '@/stores/cart.store';
import { useOrderStore } from '@/stores/orderStore';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function CartPanel() {
  const { authData } = useAuth();
  const localCarts = useCartStore((state) => state.carts);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const replaceCart = useCartStore((state) => state.replaceCart);
  const [carts, setCarts] = useState<Cart[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const addOrder = useOrderStore((state) => state.addOrder);
  const clearOrder = useOrderStore((state) => state.clearOrder);

  const searchParams = useSearchParams();

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const getData = async () => {
      setLoading(true);
      try {
        if (!authData.userId) {
          const cartsToSend = mapCartToDto(localCarts);
          if (cartsToSend.length > 0) {
            const res = await api.post('/carts/get-carts', cartsToSend);
            const validProducts = res.data.filter(Boolean);
            const cartsRecive = mapCartFronDto(validProducts);
            setCarts(cartsRecive);
            const idParam = searchParams.get('id');
            if (idParam) {
              const id = Number(idParam);
              const match = cartsRecive.find((c) => c.id === id);
              if (match) setSelected([id]);
            }
            replaceCart(
              cartsRecive.map((c) => ({
                id: c.id,
                quantity: c.quantity,
                dateTime: new Date(c.dateTime).toISOString(),
              }))
            );
          }
        } else {
          const res = await api.get(`/carts/${authData.userId}`);
          const validProducts = res.data.filter(Boolean);
          const cartsRecive = mapCartFronDto(validProducts);
          setCarts(cartsRecive);
          const idParam = searchParams.get('id');
          if (idParam) {
            const id = Number(idParam);
            const match = cartsRecive.find((c) => c.id === id);
            if (match) setSelected([id]);
          }
        }
      } catch {
        toast.error('Lỗi lấy giỏ hàng');
        router.back();
      } finally {
        emitCartChange();
        setLoading(false);
      }
    };

    getData();
  }, [authData.userId, hydrated, router, searchParams]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((spid) => spid !== id) : [...prev, id]));
  };

  const handleQuantityChange = async (id: number, value: string) => {
    const quantity = Math.max(1, Number(value) || 1);
    const cart = carts.find((c) => c.id === id);
    if (!cart) return;
    if (!authData?.userId) {
      try {
        const response = await api.post('/carts/get-carts', [{ S_id: id, GH_soLuong: quantity }]);
        const updated = response.data ?? null;
        if (!updated) {
          removeFromCart(id);
          setCarts((prev) => prev.filter((c) => c.id !== id));
          setSelected((prev) => prev.filter((spid) => spid !== id));
        } else {
          const newCart = mapCartFronDto(updated);
          updateQuantity(id, newCart[0].quantity);
          setCarts((prev) => prev.map((c) => (c.id === id ? newCart[0] : c)));
        }
      } catch {
        toast.error('Lỗi cập nhật số lượng:');
        router.back();
      }
    } else {
      try {
        const response = await api.put('/carts', {
          KH_id: authData.userId,
          S_id: id,
          GH_soLuong: quantity,
        });
        emitCartChange();
        const updated = response.data ?? null;
        if (!updated) {
          setCarts((prev) => prev.filter((c) => c.id !== id));
          setSelected((prev) => prev.filter((spid) => spid !== id));
        } else {
          const newCart = mapCartFronDto(updated);
          updateQuantity(id, newCart[0].quantity);
          setCarts((prev) => prev.map((c) => (c.id === id ? newCart[0] : c)));
        }
      } catch {
        toast.error('Lỗi cập nhật số lượng:');
        router.back();
      }
    }
  };

  const handleRemove = async (id: number) => {
    if (!authData?.userId) {
      removeFromCart(id);
      setCarts((prev) => prev.filter((c) => c.id !== id));
      setSelected((prev) => prev.filter((spid) => spid !== id));
    } else {
      try {
        await api.delete<Cart[]>('/carts', {
          params: { KH_id: authData.userId, S_id: id },
        });
        emitCartChange();
        setCarts((prev) => prev.filter((c) => c.id !== id));
        setSelected((prev) => prev.filter((spid) => spid !== id));
      } catch {
        toast.error('Lỗi cập nhật số lượng:');
        router.back();
      }
    }
  };

  const handleCheckout = () => {
    const selectedItems = carts.filter((c) => selected.includes(c.id));
    clearOrder();
    selectedItems.forEach((item) => {
      addOrder(item);
    });
    router.push('/checkout');
  };

  if (loading)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center py-10 text-gray-600"
      >
        <Loader2 className="w-6 h-6 mb-2 animate-spin" />
        <p className="text-gray-600">Đang tải dữ liệu giỏ hàng...</p>
      </motion.div>
    );

  if (!carts.length && carts.length === 0)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-10 text-gray-600"
      >
        <ShoppingCart className="w-10 h-10 mb-3 text-gray-400" />
        <motion.p
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-medium"
        >
          Giỏ hàng của bạn đang trống
        </motion.p>
        <p className="mt-1 text-sm text-gray-500">Hãy thêm sách để bắt đầu mua sắm nhé!</p>
      </motion.div>
    );

  const outStockCarts = carts.filter((c) => c.quantity === 0);
  const inStockCarts = carts.filter((c) => c.quantity > 0);
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Giỏ hàng</h1>
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between p-3 rounded shadow bg-zinc-50">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selected.length === inStockCarts.length}
                onCheckedChange={() => {
                  if (selected.length === inStockCarts.length) {
                    setSelected([]);
                  } else {
                    setSelected(inStockCarts.map((c) => c.id));
                  }
                }}
              />
              <span className="text-sm text-zinc-700">
                Đã chọn {selected.length}/{inStockCarts.length}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {inStockCarts.map((c) => (
              <CartItem
                key={c.id}
                cart={c}
                isSelected={selected.includes(c.id)}
                onToggle={() => toggleSelect(c.id)}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
          {outStockCarts.length > 0 && (
            <div className="mt-6 space-y-2">
              <div>Tạm hết hàng</div>
              {outStockCarts.map((c) => (
                <CartItem
                  key={c.id}
                  cart={c}
                  isSelected={selected.includes(c.id)}
                  onToggle={() => toggleSelect(c.id)}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>

        <div
          className={clsx(
            'flex justify-end items-center bg-white shadow px-4 py-3 gap-4 border-t',
            'lg:static lg:border-none  lg:p-4 lg:rounded-md lg:flex-col lg:items-start lg:h-fit lg:gap-4 lg:w-fit',
            'fixed bottom-0 left-0 right-0 z-30'
          )}
        >
          <div className="flex items-center justify-end text-sm lg:w-full text-zinc-600">
            <span>Tổng tiền :</span>
            <span className="text-lg font-semibold text-red-500">
              {selected
                .reduce((sum, id) => {
                  const cart = inStockCarts.find((c) => c.id === id);
                  return sum + (cart?.discountPrice ?? 0) * (cart?.quantity ?? 1);
                }, 0)
                .toLocaleString()}
              ₫
            </span>
          </div>

          <Button
            className="px-6 py-2 rounded-md cursor-pointer md:rounded-sm lg:px-20 lg:py-4"
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
