import CategoryDetail from '@/components/category/category-detail';

export default async function Page() {
  return (
    <div className="p-4">
      <div className="relative w-full max-w-xl mx-auto h-fit min-w-md">
        <CategoryDetail />
      </div>
    </div>
  );
}
