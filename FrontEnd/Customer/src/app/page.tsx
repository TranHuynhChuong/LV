import { Suspense } from 'react';
import { AxiosServer } from '@/lib/axios-server';
import { BookSortType } from '@/models/book';
import HomeComponent from '@/components/home/home';

export default async function HomePage() {
  const pageSize = 8;
  const fetchBooks = async (sort: BookSortType) => {
    const api = await AxiosServer();
    try {
      const res = await api.get('/books/search', {
        params: {
          keyword: '',
          categoryId: '',
          page: 1,
          sortType: sort,
          filterType: 'show-all',
          limit: pageSize,
        },
      });
      return res.data.data;
    } catch {
      return [];
    }
  };
  const [mostRated, latest, bestSelling] = await Promise.all([
    fetchBooks(BookSortType.MostRating),
    fetchBooks(BookSortType.Latest),
    fetchBooks(BookSortType.BestSelling),
  ]);

  return (
    <Suspense>
      <HomeComponent mostRated={mostRated} latest={latest} bestSelling={bestSelling} />
    </Suspense>
  );
}
