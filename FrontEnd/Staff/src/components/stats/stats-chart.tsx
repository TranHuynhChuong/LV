import { Stats } from '@/models/stats';
import StatsOrderComposedChart from '@/components/stats/stats-composedchart';
import RatioPieChart from '@/components/stats/stats-ratio-piechart';
import StatsBarChart from '@/components/stats/stats-barchart';
import StatsSummary from './stats-sumary';
import { TimeUnit } from './stats-panel';

type Props = {
  stats: Stats;
  timeUnit: TimeUnit;
  totalOrders: {
    complete: number;
    inComplete: number;
    all: number;
    canceled: number;
  };
};

export default function StatsChart({ stats, timeUnit, totalOrders }: Readonly<Props>) {
  return (
    <div className="space-y-4">
      <StatsSummary detail={stats.orders} />

      <div className="min-h-[350px] bg-white rounded-md border p-4">
        <StatsOrderComposedChart detail={stats.orders} mode={timeUnit} />
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <div className="basis-1/3 min-h-[350px] bg-white rounded-md border p-4 ">
          <RatioPieChart
            title="Tỷ lệ giao hàng"
            data={[totalOrders?.complete, totalOrders?.inComplete]}
            labels={['Giao thành công', 'Giao thất bại']}
            unit="Đơn hàng"
            colors={['#15803d', '#b91c1c']}
          />
        </div>
        <div className="basis-1/3 min-h-[350px] bg-white rounded-md border p-4 ">
          <RatioPieChart
            title="Tỷ lệ sản phẩm có giảm giá khi mua"
            data={[
              stats.totalDiscountStats.discountedProducts,
              stats.totalDiscountStats.totalProducts - stats.totalDiscountStats.discountedProducts,
            ]}
            labels={['Có giảm', 'Không giảm']}
            unit="Sản phẩm"
            colors={['#0f766e', '#be185d']}
          />
        </div>
        <div className="basis-1/3 min-h-[350px] bg-white rounded-md border p-4 ">
          <RatioPieChart
            title="Tỷ lệ người loại người mua trên đơn hàng"
            data={[stats.buyers.member, stats.buyers.guest]}
            labels={['Thành viên', 'Khách vãng lai']}
            colors={['#65a30d', '#374151']}
          />
        </div>
      </div>

      <div className=" min-h-[350px] bg-white rounded-md border p-4 flex flex-col md:flex-row">
        <div className="basis-1/2">
          <StatsBarChart
            title="Mã giảm giá được dùng"
            data={[
              { name: 'Phí ship', value: stats.vouchers.typeStats.shipping },
              { name: 'Tiền hàng', value: stats.vouchers.typeStats.order },
            ]}
            unit="Lượt dùng"
            colors={['#15803d', '#c2410c']}
          />
        </div>
        <div className="basis-1/2">
          <RatioPieChart
            title="Tỷ lệ dùng mã giảm giá trên đơn hàng"
            data={[
              stats.vouchers.orderUsed,
              totalOrders.complete + totalOrders.inComplete - stats.vouchers.orderUsed,
            ]}
            labels={['Có dùng', 'Không dùng']}
            unit="Đơn hàng"
            colors={['#0f766e', '#be185d']}
          />
        </div>
      </div>

      <div className="min-h-[350px] bg-white rounded-md border p-4 flex flex-col md:flex-row">
        <div className="basis-1/2 h-[350px] ">
          <StatsBarChart
            title="Điểm đánh giá"
            data={[
              { name: '1 Sao', value: stats.reviews.s1 },
              { name: '2 Sao', value: stats.reviews.s2 },
              { name: '3 Sao', value: stats.reviews.s3 },
              { name: '4 Sao', value: stats.reviews.s4 },
              { name: '5 Sao', value: stats.reviews.s5 },
            ]}
            unit="Đánh giá"
            barSize={40}
            colors={['#b91c1c', '#dc2626', '#f97316', '#f59e0b', '#eab308']}
          />
        </div>
        <div className="basis-1/2">
          <RatioPieChart
            title="Tỷ lệ đánh giá của khách hàng thành viên sau khi nhận hàng"
            data={[stats.reviews.totalOrders, stats.buyers.member - stats.reviews.totalOrders]}
            labels={['Có đánh giá', 'Không đánh giá']}
            unit="Đơn hàng"
            colors={['#0f766e', '#be185d']}
          />
        </div>
      </div>
      <div className=" min-h-[350px] bg-white rounded-md border p-4 ">
        <StatsBarChart
          title="Khu vực đặt hàng (đơn hàng được đặt)"
          data={stats.provinces.map((p) => ({
            name: `${p.provinceName}`,
            value: p.count,
          }))}
          barSize={20}
          unit="Đơn hàng"
        />
      </div>
    </div>
  );
}
