import HomePage from './_components/HomePage';
import api from '@/lib/axiosServer';

async function fetchHomeData() {
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
}

export default async function Home() {
  const data = await fetchHomeData();

  return <HomePage data={data} />;
}
