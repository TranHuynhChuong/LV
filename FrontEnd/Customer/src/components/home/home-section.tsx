'use client';

import Link from 'next/link';
import { BookList } from '@/components/book/book-list';
import { Book } from '@/models/book';
import { Button } from '../ui/button';

type HomeSectionProps = {
  title: string;
  books: Book[];
  showViewMore?: boolean;
  viewMoreLink?: string;
};

export default function HomeSection({
  title,
  books,
  showViewMore = false,
  viewMoreLink = '#',
}: Readonly<HomeSectionProps>) {
  return (
    <section className="p-6 space-y-6 bg-white rounded-md">
      <h2 className="text-lg font-semibold">{title}</h2>
      <BookList books={books} displayType="carousel" />
      {showViewMore && viewMoreLink && (
        <div className="flex justify-center w-full">
          <Link href={viewMoreLink}>
            <Button variant="outline" className="px-12 text-sm cursor-pointer border-zinc-400">
              Xem thêm
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}
