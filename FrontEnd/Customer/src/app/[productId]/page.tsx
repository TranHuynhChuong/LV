'use client';

import api from '@/lib/axiosClient';
import {
  ProductDetailApiType,
  PromotionApiItem,
  ProductDetailType,
  ImageApi,
} from '@/types/products';
import { useParams, useRouter } from 'next/navigation';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ProductImageGallery from './components/productImgs';
import ProductBaseInfo from './components/productBaseInf';

const mapProductToForm = (
  product: ProductDetailApiType,
  promotion: PromotionApiItem[]
): ProductDetailType => {
  const getCoverImageUrl = (images: ImageApi[]): string => {
    const cover = images.find((img) => img.A_anhBia);
    return cover ? cover.A_url : '';
  };

  const getProductImageUrls = (images: ImageApi[]): string[] => {
    return images.filter((img) => !img.A_anhBia).map((img) => img.A_url);
  };

  let salePrice = product.SP_giaBan;

  if (promotion && promotion.length > 0) {
    const first = promotion[0];
    if (!first.CTKM_theoTyLe) {
      salePrice = product.SP_giaBan - first.CTKM_giaTri;
    } else {
      salePrice = product.SP_giaBan - (first.CTKM_giaTri / 100) * product.SP_giaBan;
    }
  }

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
    salePrice,
    coverImage: getCoverImageUrl(product.SP_anh),
    productImages: getProductImageUrls(product.SP_anh),
  };
};

export default function ProductDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.productId as string;

  const [data, setData] = useState<ProductDetailType>();
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProductDetail = async () => {
    if (!id) return;
    setLoading(true);

    const params = {
      mode: 'full',
      filterType: '1',
    };

    try {
      const res = await api.get(`/products/${id}`, { params });
      const { product, promotion } = res.data;
      setData(mapProductToForm(product, promotion));
    } catch (error) {
      console.error(error);
      toast.error('Không tìm thấy sản phẩm!');
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  if (data)
    return (
      <div>
        <div className="flex flex-wrap gap-4 h-full">
          <div className="basis-0 flex-[5] min-w-86 h-124">
            <ProductImageGallery coverImage={data.coverImage} productImages={data.productImages} />
          </div>

          <div className="basis-0 flex-[7]">
            <ProductBaseInfo data={data} />
          </div>
        </div>
      </div>
    );
}
