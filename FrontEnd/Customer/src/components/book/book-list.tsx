import BookItem from './book-item';
import { BookOverview } from '@/models/book';
import clsx from 'clsx';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';
import BookItemLoading from './book-item-loading';

type BookListProps = {
  books: BookOverview[];
  displayType?: 'grid' | 'carousel';
  isLoading?: boolean;
  pageSize?: number;
};

export function BookList({
  books,
  isLoading = false,
  displayType,
  pageSize = 24,
}: Readonly<BookListProps>) {
  if (displayType === 'carousel') {
    return (
      <Carousel className="w-full">
        <CarouselContent>
          {books.map((book, index) => (
            <CarouselItem key={index} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <div className="p-1">
                <BookItem key={book.id} book={book} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
  }
  return (
    <div
      className={clsx(
        'grid gap-2',
        'grid-cols-2',
        'sm:grid-cols-3',
        'md:grid-cols-4',
        'lg:grid-cols-5'
      )}
    >
      {isLoading
        ? Array.from({ length: pageSize }).map((_, index) => <BookItemLoading key={index} />)
        : books.map((book) => <BookItem key={book.id} book={book} />)}
    </div>
  );
}
