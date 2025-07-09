'use client';

import CartItem from '@/components/carts/cartItem';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import { emitCartChange } from '@/lib/cartEvents';
import { Cart, mapCartFronDto, mapCartToDto } from '@/models/carts';
import { useCartStore } from '@/stores/cart.store';
import { useOrderStore } from '@/stores/orderStore';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CartPage() {
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

    const fetchCartProducts = async () => {
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
              const match = cartsRecive.find((c) => c.productId === id);
              if (match) setSelected([id]);
            }
            replaceCart(
              cartsRecive.map((c) => ({
                productId: c.productId,
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
            const match = cartsRecive.find((c) => c.productId === id);
            if (match) setSelected([id]);
          }
        }
      } catch (error) {
        console.error('Lỗi lấy giỏ hàng:', error);
      } finally {
        emitCartChange();
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
    const cart = carts.find((c) => c.productId === id);
    if (!cart) return;
    if (!authData?.userId) {
      try {
        const response = await api.post('/carts/get-carts', [{ SP_id: id, GH_soLuong: quantity }]);
        const updated = response.data ?? null;
        if (!updated) {
          removeFromCart(id);
          setCarts((prev) => prev.filter((c) => c.productId !== id));
          setSelected((prev) => prev.filter((spid) => spid !== id));
        } else {
          const newCart = mapCartFronDto(updated);
          updateQuantity(id, newCart[0].quantity);
          setCarts((prev) => prev.map((c) => (c.productId === id ? newCart[0] : c)));
        }
      } catch (error) {
        console.error('Lỗi cập nhật số lượng:', error);
      }
    } else {
      try {
        const response = await api.put('/carts', {
          KH_id: authData.userId,
          SP_id: id,
          GH_soLuong: quantity,
        });
        emitCartChange();
        const updated = response.data ?? null;
        if (!updated) {
          setCarts((prev) => prev.filter((c) => c.productId !== id));
          setSelected((prev) => prev.filter((spid) => spid !== id));
        } else {
          const newCart = mapCartFronDto(updated);
          updateQuantity(id, newCart[0].quantity);
          setCarts((prev) => prev.map((c) => (c.productId === id ? newCart[0] : c)));
        }
      } catch (error) {
        console.error('Lỗi cập nhật số lượng:', error);
      }
    }
  };

  const handleRemove = async (id: number) => {
    if (!authData?.userId) {
      removeFromCart(id);
      setCarts((prev) => prev.filter((c) => c.productId !== id));
      setSelected((prev) => prev.filter((spid) => spid !== id));
    } else {
      try {
        await api.delete<Cart[]>('/carts', {
          params: { KH_id: authData.userId, SP_id: id },
        });
        emitCartChange();
        setCarts((prev) => prev.filter((c) => c.productId !== id));
        setSelected((prev) => prev.filter((spid) => spid !== id));
      } catch (error) {
        console.error('Lỗi cập nhật số lượng:', error);
      }
    }
  };

  const handleCheckout = () => {
    const selectedItems = carts.filter((c) => selected.includes(c.productId));
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
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        <p className="text-gray-600">Đang tải dữ liệu giỏ hàng...</p>
      </motion.div>
    );

  // Khi giỏ hàng trống
  if (!carts.length)
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
        <p className="text-sm text-gray-500 mt-1">Hãy thêm sản phẩm để bắt đầu mua sắm nhé!</p>
      </motion.div>
    );

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Giỏ hàng</h1>

      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between p-3 rounded bg-zinc-50 shadow">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selected.length === carts.length}
                onCheckedChange={() => {
                  if (selected.length === carts.length) {
                    setSelected([]);
                  } else {
                    setSelected(carts.map((c) => c.productId));
                  }
                }}
              />
              <span className="text-sm text-zinc-700">
                Đã chọn {selected.length}/{carts.length} sản phẩm
              </span>
            </div>
          </div>

          {carts.map((c) => (
            <CartItem
              key={c.productId}
              cart={c}
              isSelected={selected.includes(c.productId)}
              onToggle={() => toggleSelect(c.productId)}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemove}
            />
          ))}
        </div>

        <div
          className={clsx(
            'flex justify-end items-center bg-white shadow px-4 py-3 gap-4 border-t',
            'lg:static lg:border-none  lg:p-4 lg:rounded-md lg:flex-col lg:items-start lg:h-fit lg:gap-4 lg:w-fit',
            'fixed bottom-0 left-0 right-0 z-30'
          )}
        >
          <div className="text-sm flex   lg:w-full justify-end items-center text-zinc-600">
            <span>Tổng tiền :</span>
            <span className="font-semibold text-lg text-red-500">
              {selected
                .reduce((sum, id) => {
                  const cart = carts.find((c) => c.productId === id);
                  return sum + (cart?.discountPrice ?? 0) * (cart?.quantity ?? 1);
                }, 0)
                .toLocaleString()}
              ₫
            </span>
          </div>

          <Button
            className="rounded-md md:rounded-sm px-6 py-2 lg:px-20 lg:py-4 cursor-pointer"
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
