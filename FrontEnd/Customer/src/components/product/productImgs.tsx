'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import Overlay from '@/components/utils/OverLay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';

type Props = {
  coverImage: string;
  productImages: string[];
};

export default function ProductImageGallery({ coverImage, productImages }: Readonly<Props>) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string>(coverImage);

  const displayImages = [coverImage, ...productImages];
  const handlePreview = (img: string) => {
    setActiveImage(img);
    setPreviewOpen(true);
  };

  return (
    <>
      <div className="space-y-2 w-full h-full flex flex-col rounded-xl bg-white shadow p-4 ">
        {/* Ảnh chính + nút trái/phải */}
        <div className="relative w-full flex-1">
          {/* Nút trái */}
          {activeImage !== displayImages[0] && (
            <button
              className="z-10 absolute top-1/2 left-2 -translate-y-1/2 bg-zinc-500/30 p-1 rounded-full"
              onClick={() => {
                const currentIndex = displayImages.indexOf(activeImage);
                if (currentIndex > 0) {
                  setActiveImage(displayImages[currentIndex - 1]);
                }
              }}
            >
              <ChevronLeft size={24} color="white" />
            </button>
          )}

          {/* Ảnh chính */}
          <Image
            src={activeImage}
            alt="Ảnh chính"
            fill
            priority
            sizes="(min-width: 0px) 100%"
            className="object-contain p-2 cursor-pointer"
            onClick={() => handlePreview(activeImage)}
          />

          {/* Nút phải */}
          {activeImage !== displayImages[displayImages.length - 1] && (
            <button
              className="z-10 absolute top-1/2 right-2 -translate-y-1/2 bg-zinc-500/30 p-1 rounded-full"
              onClick={() => {
                const currentIndex = displayImages.indexOf(activeImage);
                if (currentIndex < displayImages.length - 1) {
                  setActiveImage(displayImages[currentIndex + 1]);
                }
              }}
            >
              <ChevronRight size={24} color="white" />
            </button>
          )}
        </div>

        <Carousel className="w-full">
          <CarouselContent>
            {displayImages.map((img, index) => (
              <CarouselItem key={index} className="basis-1/5">
                <div className="p-1">
                  <Button
                    variant="ghost"
                    key={index}
                    className="relative w-18 h-18 flex-shrink-0"
                    onClick={() => setActiveImage(img)}
                  >
                    <Image
                      src={img}
                      alt={`thumb-${index}`}
                      fill
                      sizes="(min-width: 0px) 100%"
                      className={clsx(
                        'object-contain rounded-sm border cursor-pointer w-auto h-full',
                        img === activeImage && 'ring-1 ring-zinc-500'
                      )}
                    />
                  </Button>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* === XEM ẢNH TO (Modal full màn hình) === */}
      {previewOpen && (
        <Overlay>
          <div className="flex flex-col items-center justify-center h-full w-full">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 text-white z-50 cursor-pointer bg-zinc-800/90"
              onClick={() => setPreviewOpen(false)}
            >
              <X size={32} />
            </Button>

            {/* Ảnh to */}
            <div className="relative w-full flex-1 ">
              <Image
                src={activeImage}
                alt="Ảnh chính"
                fill
                className="object-contain p-2 cursor-pointer"
              />
            </div>

            {/* Ảnh nhỏ bên dưới */}
            <div className="flex gap-2 overflow-x-auto max-w-full pb-4 p-1">
              {displayImages.map((img, index) => (
                <Button
                  variant="ghost"
                  key={index}
                  className="relative w-20 h-20 cursor-pointer"
                  onClick={() => setActiveImage(img)}
                >
                  <Image
                    src={img}
                    alt={`preview-thumb-${index}`}
                    fill
                    className={clsx(
                      'object-cover rounded-sm',
                      img === activeImage && 'ring-2 ring-blue-500'
                    )}
                  />
                </Button>
              ))}
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}
