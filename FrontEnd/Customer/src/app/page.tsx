import { Suspense } from 'react';
import api from '@/lib/axios';
import { ProductSortType, mapProductOverviewListFromDto } from '@/models/products';
import HomeComponent from '@/components/home/homeComponent';

export default async function HomePage() {
  const pageSize = 8;

  const fetchProducts = async (sort: ProductSortType) => {
    try {
      const res = await api.get('/products/search', {
        params: {
          keyword: '',
          categoryId: '',
          page: 1,
          sortType: sort,
          filterType: 'show-all',
          limit: pageSize,
        },
      });
      return mapProductOverviewListFromDto(res.data.data);
    } catch (error) {
      console.error(`Error fetching products sorted by ${sort}:`, error);
      return [];
    }
  };

  const [mostRated, latest, bestSelling] = await Promise.all([
    fetchProducts(ProductSortType.MostRating),
    fetchProducts(ProductSortType.Latest),
    fetchProducts(ProductSortType.BestSelling),
  ]);

  return (
    <Suspense fallback={<></>}>
      <HomeComponent mostRated={mostRated} latest={latest} bestSelling={bestSelling} />
    </Suspense>
  );
}
