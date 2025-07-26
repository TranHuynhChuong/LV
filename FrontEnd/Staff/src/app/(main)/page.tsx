import { redirect } from 'next/navigation';
import HomePage from '../../components/home/home';
import api from '@/lib/axios';

async function fetchHomeData() {
  try {
    const [products, categories, promotions, vouchers, shipping, orders] = await Promise.all([
      api.get('products/total'),
      api.get('categories/total'),
      api.get('promotions/total'),
      api.get('vouchers/total'),
      api.get('shipping/total'),
      api.get('orders/total'),
    ]);

    return {
      products: products.data,
      categories: categories.data,
      promotions: promotions.data,
      vouchers: vouchers.data,
      shipping: shipping.data,
      orders: orders.data,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const status = err?.response?.status;

    if (status === 401 || status === 403) {
      if (typeof window !== 'undefined') {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/login';
      } else {
        redirect('/login');
      }
    }
    throw err;
  }
}

export default async function Page() {
  const data = await fetchHomeData();

  return <HomePage data={data} />;
}
