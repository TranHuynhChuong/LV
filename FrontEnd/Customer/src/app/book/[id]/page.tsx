import BookImages from '@/components/book/book-images';
import BookInfo from '@/components/book/book-inf';
import { BookList } from '@/components/book/book-list';
import ReviewsSection from '@/components/review/review-section';
import { AxiosServer } from '@/lib/axios-server';
import NotFound from '@/components/layout/not-found';
import { Image } from '@/models/book';

async function getData(id: string) {
  const api = await AxiosServer();
  if (!id) return null;
  try {
    const res = await api.get(`/books/${id}`, {
      params: { mode: 'full' },
    });
    return res.data;
  } catch {
    return null;
  }
}

export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) {
    return <NotFound />;
  }

  const images = [
    ...data.images.filter((img: Image) => img.isCover).map((img: Image) => img.url),
    ...data.images.filter((img: Image) => !img.isCover).map((img: Image) => img.url),
  ];

  return (
    <div className="space-y-4 ">
      <div className="relative flex flex-col gap-4 lg:flex-row">
        <div className="basis-0 flex-[5] w-full lg:max-w-lg">
          <div className="sticky z-40 top-4">
            <div className=" min-w-86 h-124">
              <BookImages images={images} />
            </div>
          </div>
        </div>
        <div className="basis-0 flex-[7] w-full space-y-4">
          <BookInfo data={data} />
        </div>
      </div>
      <div className="w-full p-4 bg-white rounded-md shadow">
        <ReviewsSection
          bookId={data.bookId}
          rating={data.reviewCount && data.reviewCount > 0 ? data.rating / data.reviewCount : 0}
        />
      </div>
      <div className="w-full p-4 bg-white rounded-md shadow">
        <h2 className="mb-4 text-lg font-semibold">Gợi ý tương tự</h2>
        <BookList displayType="carousel" books={data.similar} />
      </div>
    </div>
  );
}
