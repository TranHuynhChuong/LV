'use client';

import api from '@/lib/axiosClient';
import { ProductDetailApiType, ProductDetailType, ImageApi } from '@/types/products';
import { useParams, useRouter } from 'next/navigation';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ProductImageGallery from '../components/productImgs';
import ProductInfo from '../components/productInf';
import Loading from './loading';
import Comments from '../components/comments';
import { ProductList } from '@/components/product/productList';

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
    categories: product.SP_TL.map((tl: { TL_id: number; TL_ten: string }) => ({
      id: tl.TL_id,
      name: tl.TL_ten,
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
    salePrice: product.SP_giaGiam,
    coverImage: getCoverImageUrl(product.SP_anh),
    productImages: getProductImageUrls(product.SP_anh),
    similar: product.SP_tuongTu.map((item) => {
      const selePrice = item.SP_giaGiam === item.SP_giaBan ? undefined : item.SP_giaGiam;
      const discountPercent = selePrice
        ? Math.round(((item.SP_giaBan - item.SP_giaGiam) / item.SP_giaBan) * 100)
        : undefined;

      return {
        id: item.SP_id,
        name: item.SP_ten,
        price: item.SP_giaBan,
        cost: item.SP_giaNhap,
        sold: item.SP_daBan,
        stock: item.SP_tonKho,
        image: item.SP_anh,
        status: item.SP_trangThai,
        score: item.SP_diemDG,
        categories: item.TL_id,
        selePrice: selePrice,
        discountPercent: discountPercent,
      };
    }),
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
        <Comments id={data.id} score={data.score} />
      </div>

      <div className="w-full p-4 rounded-md shadow bg-white">
        <h2 className="font-semibold mb-4 text-lg">Sản phẩm tương tự</h2>
        <ProductList displayType="carousel" products={data.similar} />
      </div>
    </div>
  );
}
