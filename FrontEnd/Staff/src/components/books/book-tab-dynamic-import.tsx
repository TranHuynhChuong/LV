import dynamic from 'next/dynamic';
import BookTabLoading from './book-tab-loading';

export const BookTab = dynamic(() => import('@/components/books/book-tab'), {
  ssr: false,
  loading: () => <BookTabLoading />,
});
