'use client';

import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Loading from './loading';
import { ProductList } from '@/components/product/productList';
import { mapProductDetailFormDto } from '@/models/products';
import type { ProductDetail } from '@/models/products';
import ProductImageGallery from '@/components/product/productImgs';
import ProductInfo from '@/components/product/productInf';
import ReviewsSection from '@/components/reviews/reviewSection';

export default function ProductDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.productId as string;
  const [data, setData] = useState<ProductDetail>();

  const fetchProductDetail = async () => {
    if (!id) return;

    const params = {
      mode: 'full',
      filterType: '11',
    };

    try {
      const res = await api.get(`/products/${id}`, { params });
      const product = res.data;
      setData(mapProductDetailFormDto(product));
    } catch (error) {
      console.error(error);
      toast.error('Không tìm thấy sản phẩm!');
      router.replace('/');
    }
  };

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  if (!data) {
    return <Loading />;
  }

  return (
    <div className="space-y-4 ">
      <div className="flex flex-col md:flex-row gap-4 relative">
        {/* Cột trái: ảnh sản phẩm */}
        <div className="basis-0 flex-[5] w-full">
          <div className="sticky top-4  z-40">
            <div className=" min-w-86 h-124 ">
              <ProductImageGallery
                coverImage={data.coverImage}
                productImages={data.productImages}
              />
            </div>
          </div>
        </div>

        {/* Cột phải: nội dung sản phẩm */}
        <div className="basis-0 flex-[7] w-full space-y-4">
          <ProductInfo data={data} />
        </div>
      </div>
      <div className="w-full p-4 rounded-md shadow bg-white">
        <ReviewsSection productId={data.id} rating={data.rating} />
      </div>

      <div className="w-full p-4 rounded-md shadow bg-white">
        <h2 className="font-semibold mb-4 text-lg">Sản phẩm tương tự</h2>
        <ProductList displayType="carousel" products={data.similar} />
      </div>
    </div>
  );
}
