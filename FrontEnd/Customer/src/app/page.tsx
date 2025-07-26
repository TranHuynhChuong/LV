import { Suspense } from 'react';
import api from '@/lib/axios';
import { BookSortType, mapBookOverviewListFromDto } from '@/models/book';
import HomeComponent from '@/components/home/home';

export default async function HomePage() {
  const pageSize = 8;

  const fetchBooks = async (sort: BookSortType) => {
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
      return mapBookOverviewListFromDto(res.data.data);
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
    <Suspense fallback={<></>}>
      <HomeComponent mostRated={mostRated} latest={latest} bestSelling={bestSelling} />
    </Suspense>
  );
}
