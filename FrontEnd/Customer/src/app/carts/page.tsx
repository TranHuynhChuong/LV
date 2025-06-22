'use client';

import { useEffect, useState } from 'react';
import { useCartStore, CartItemType, GioHangItem } from '@/stores/cart.store';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axiosClient';
import { Checkbox } from '@/components/ui/checkbox';
import CartItem, { ProductInCart } from './components/cartItem';
import { emitCartChange } from '@/lib/cartEvents';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useOrderStore } from '@/stores/orderStore';
import { motion } from 'framer-motion';
import { ShoppingCart, Loader2 } from 'lucide-react';

export interface ApiCartRes {
  SP_id: number;
  SP_ten: string;
  SP_anh: string;
  SP_giaBan: number;
  SP_giaGiam: number;
  SP_giaNhap: number;
  SP_tonKho: number;
  SP_trongLuong: number;
  GH_soLuong: number;
  GH_thoiGian: string;
}

export function mapCartToGioHang(cartItems: CartItemType[]): GioHangItem[] {
  return cartItems.map((item) => ({
    SP_id: item.productId,
    GH_soLuong: item.quantity,
    GH_thoiGian: item.dateTime,
  }));
}

export function mapGioHangToCart(gioHangItems: ApiCartRes[]): ProductInCart[] {
  return gioHangItems.map((item) => ({
    productId: item.SP_id,
    quantity: item.GH_soLuong,
    dateTime: item.GH_thoiGian,
    cover: item.SP_anh,
    name: item.SP_ten,
    cost: item.SP_giaNhap,
    price: item.SP_giaBan,
    salePrice: item.SP_giaGiam,
    stock: item.SP_tonKho,
    weight: item.SP_trongLuong,
  }));
}

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

  const router = useRouter();
  const addProduct = useOrderStore((state) => state.addProduct);
  const clearOrder = useOrderStore((state) => state.clearOrder);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const fetchCartProducts = async () => {
      setLoading(true);
      try {
        if (!authData.userId) {
          const cartsToSend = mapCartToGioHang(localCarts);
          if (cartsToSend.length > 0) {
            const res = await api.post('/carts/get-carts', cartsToSend);

            const validProducts = res.data.filter(Boolean);
            const cartsRecive = mapGioHangToCart(validProducts);
            setProducts(cartsRecive);

            replaceCart(
              cartsRecive.map((p) => ({
                productId: p.productId,
                quantity: p.quantity,
                dateTime: new Date(p.dateTime).toISOString(),
              }))
            );
          }
        } else {
          const res = await api.get(`/carts/${authData.userId}`);
          const validProducts = res.data.filter(Boolean);
          const cartsRecive = mapGioHangToCart(validProducts);
          setProducts(cartsRecive);
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
    const product = products.find((p) => p.productId === id);
    if (!product) return;

    if (!authData?.userId) {
      try {
        const response = await api.post('/carts/get-carts', [{ SP_id: id, GH_soLuong: quantity }]);
        const updated = response.data ?? null;

        if (!updated) {
          removeFromCart(id);
          setProducts((prev) => prev.filter((p) => p.productId !== id));
          setSelected((prev) => prev.filter((spid) => spid !== id));
        } else {
          const newCart = mapGioHangToCart(updated);
          updateQuantity(id, newCart[0].quantity);
          setProducts((prev) => prev.map((p) => (p.productId === id ? newCart[0] : p)));
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
          setProducts((prev) => prev.filter((p) => p.productId !== id));
          setSelected((prev) => prev.filter((spid) => spid !== id));
        } else {
          const newCart = mapGioHangToCart(updated);
          updateQuantity(id, newCart[0].quantity);
          setProducts((prev) => prev.map((p) => (p.productId === id ? newCart[0] : p)));
        }
      } catch (error) {
        console.error('Lỗi cập nhật số lượng:', error);
      }
    }
  };

  const handleRemove = async (id: number) => {
    if (!authData?.userId) {
      removeFromCart(id);
      setProducts((prev) => prev.filter((p) => p.productId !== id));
      setSelected((prev) => prev.filter((spid) => spid !== id));
    } else {
      try {
        await api.delete<ProductInCart[]>('/carts', {
          params: { KH_id: authData.userId, SP_id: id },
        });

        emitCartChange();

        setProducts((prev) => prev.filter((p) => p.productId !== id));
        setSelected((prev) => prev.filter((spid) => spid !== id));
      } catch (error) {
        console.error('Lỗi cập nhật số lượng:', error);
      }
    }
  };

  const handleCheckout = () => {
    const selectedItems = products.filter((p) => selected.includes(p.productId));

    clearOrder();

    selectedItems.forEach((item) => {
      addProduct({
        productId: item.productId,
        salePrice: item.salePrice,
        price: item.price,
        cost: item.cost,
        quantity: item.quantity,
        cover: item.cover,
        name: item.name,
        weight: item.weight,
      });
    });

    router.push('/order');
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
  if (!products.length)
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
                    setSelected(products.map((p) => p.productId));
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
              key={p.productId}
              product={p}
              isSelected={selected.includes(p.productId)}
              onToggle={() => toggleSelect(p.productId)}
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
                  const product = products.find((p) => p.productId === id);
                  return sum + (product?.salePrice ?? 0) * (product?.quantity ?? 1);
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
