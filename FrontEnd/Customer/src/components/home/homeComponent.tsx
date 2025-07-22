import { ProductOverview } from '@/models/products';

import HomeSection from './homeSection';
import HomeSlidingBanner from './homeSlidingBanner';

interface HomeComponentProps {
  mostRated: ProductOverview[];
  latest: ProductOverview[];
  bestSelling: ProductOverview[];
}

export default function HomeComponent({ mostRated, latest, bestSelling }: HomeComponentProps) {
  return (
    <div className="space-y-6">
      <HomeSlidingBanner />
      {/* <HomeIntroduceSection /> */}
      <HomeSection
        title="Top sản phẩm bán chạy"
        products={bestSelling}
        showViewMore
        viewMoreLink="/search?s=best-selling"
      />
      <HomeSection
        title="Sản phẩm mới nhất"
        products={latest}
        showViewMore
        viewMoreLink="/search?s=latest"
      />
      <HomeSection
        title="Top sản phẩm có điểm đánh giá cao"
        products={mostRated}
        showViewMore
        viewMoreLink="/search?s=most-rating"
      />
    </div>
  );
}
