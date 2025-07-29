import ShippingDetail from '@/components/shipping/shipping-detail';

export default async function Page() {
  return (
    <div className="p-4">
      <div className="relative w-full max-w-xl mx-auto min-w-fit">
        <ShippingDetail />
      </div>
    </div>
  );
}
