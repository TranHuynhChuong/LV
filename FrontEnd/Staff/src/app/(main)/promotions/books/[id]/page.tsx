import BookPromotionDetail from '@/components/promotions/book/book-promotion-detail';

export default async function Page() {
  return (
    <div className="p-4">
      <div className="relative w-full max-w-6xl mx-auto">
        <BookPromotionDetail />
      </div>
    </div>
  );
}
