'use client';

import api from '@/lib/axiosClient';
import { ProductDetailApiType, ProductDetailType, ImageApi } from '@/types/products';
import { useParams, useRouter } from 'next/navigation';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ProductImageGallery from '../components/productImgs';
import ProductBaseInfo from '../components/productBaseInf';
import Loading from './loading';

const mapProductToForm = (product: ProductDetailApiType): ProductDetailType => {
  const getCoverImageUrl = (images: ImageApi[]): string => {
    const cover = images.find((img) => img.A_anhBia);
    return cover ? cover.A_url : '';
  };

  const getProductImageUrls = (images: ImageApi[]): string[] => {
    return images.filter((img) => !img.A_anhBia).map((img) => img.A_url);
  };

  return {
    name: product.SP_ten,
    id: product.SP_id,
    categories: product.SP_TL.map((tl: { id: number; ten: string }) => ({
      id: tl.id,
      name: tl.ten,
    })),
    status: product.SP_trangThai,
    summary: product.SP_tomTat,
    description: product.SP_moTa,
    author: product.SP_tacGia,
    publisher: product.SP_nhaXuatBan,
    publishYear: product.SP_namXuatBan,
    page: product.SP_soTrang,
    isbn: product.SP_isbn,
    language: product.SP_ngonNgu,
    translator: product.SP_nguoiDich,
    price: product.SP_giaBan,
    cost: product.SP_giaNhap,
    stock: product.SP_tonKho,
    saled: product.SP_daBan,
    weight: product.SP_trongLuong,
    score: product.SP_diemDG,
    salePrice: product.giaGiam,
    coverImage: getCoverImageUrl(product.SP_anh),
    productImages: getProductImageUrls(product.SP_anh),
  };
};

export default function ProductDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.productId as string;

  const [data, setData] = useState<ProductDetailType>();

  const fetchProductDetail = async () => {
    if (!id) return;

    const params = {
      mode: 'full',
      filterType: '11',
    };

    try {
      const res = await api.get(`/products/${id}`, { params });
      const product = res.data;
      console.log(product);
      setData(mapProductToForm(product));
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
    <div className="flex flex-wrap gap-4 h-full">
      <div className="basis-0 flex-[5] min-w-86 h-124">
        <ProductImageGallery coverImage={data.coverImage} productImages={data.productImages} />
      </div>

      <div className="basis-0 flex-[7] min-w-72">
        <ProductBaseInfo data={data} />
      </div>
    </div>
  );
}
