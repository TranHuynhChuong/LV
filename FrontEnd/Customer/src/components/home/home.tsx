import { BookOverview } from '@/models/book';

import HomeSection from './home-cection';
import HomeSlidingBanner from './home-sliding-banner';

type HomeComponentProps = {
  mostRated: BookOverview[];
  latest: BookOverview[];
  bestSelling: BookOverview[];
};

export default function HomeComponent({
  mostRated,
  latest,
  bestSelling,
}: Readonly<HomeComponentProps>) {
  return (
    <div className="space-y-6">
      <HomeSlidingBanner />
      <HomeSection
        title="Top sách bán chạy"
        books={bestSelling}
        showViewMore
        viewMoreLink="/search?s=best-selling"
      />
      <HomeSection
        title="Sách mới nhất"
        books={latest}
        showViewMore
        viewMoreLink="/search?s=latest"
      />
      <HomeSection
        title="Top sách có điểm đánh giá cao"
        books={mostRated}
        showViewMore
        viewMoreLink="/search?s=most-rating"
      />
    </div>
  );
}
