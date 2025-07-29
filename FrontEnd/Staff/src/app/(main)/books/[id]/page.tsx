import BookDetail from '@/components/books/book-detail';

export default function Page() {
  return (
    <div className="p-4">
      <div className="relative w-full max-w-4xl mx-auto h-fit">
        <BookDetail />
      </div>
    </div>
  );
}
