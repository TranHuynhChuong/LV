'use client';

import { Button } from '@/components/ui/button';
import Overlay from '@/components/utils/overLay';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';

type Props = {
  images: string[];
};

export default function BookImages({ images }: Readonly<Props>) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string>(images[0]);

  const displayImages = images;
  const handlePreview = (img: string) => {
    setActiveImage(img);
    setPreviewOpen(true);
  };

  return (
    <>
      <div className="flex flex-col w-full h-full p-4 space-y-2 bg-white shadow rounded-xl ">
        <div className="relative flex-1 w-full">
          {activeImage !== displayImages[0] && (
            <button
              className="absolute z-10 p-1 -translate-y-1/2 rounded-full top-1/2 left-2 bg-zinc-500/30"
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

          <Image
            src={activeImage}
            alt="Ảnh chính"
            fill
            priority
            sizes="(min-width: 0px) 100%"
            className="object-contain p-2 cursor-pointer"
            onClick={() => handlePreview(activeImage)}
          />

          {activeImage !== displayImages[displayImages.length - 1] && (
            <button
              className="absolute z-10 p-1 -translate-y-1/2 rounded-full top-1/2 right-2 bg-zinc-500/30"
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
                    className="relative flex-shrink-0 w-18 h-18"
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

      {previewOpen && (
        <Overlay>
          <div className="flex flex-col items-center justify-center w-full h-full">
            <Button
              variant="ghost"
              className="absolute z-50 text-white cursor-pointer top-4 right-4 bg-zinc-800/90"
              onClick={() => setPreviewOpen(false)}
            >
              <X size={32} />
            </Button>
            <div className="relative flex-1 w-full ">
              <Image
                src={activeImage}
                alt="Ảnh chính"
                fill
                className="object-contain p-2 cursor-pointer"
              />
            </div>

            <div className="flex max-w-full gap-2 p-1 pb-4 overflow-x-auto">
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
