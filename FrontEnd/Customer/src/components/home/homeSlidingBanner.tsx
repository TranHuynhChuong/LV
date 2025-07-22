'use client';

import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banners = ['/banner/1.png', '/banner/2.png', '/banner/3.png'];

export default function HomeSlidingBanner() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

  useEffect(() => {
    if (!instanceRef.current) return;

    timerRef.current = setInterval(() => {
      instanceRef.current?.next();
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [instanceRef]);

  return (
    <div className="relative overflow-hidden bg-white rounded-md">
      <div ref={sliderRef} className="keen-slider">
        {banners.map((src, i) => (
          <div key={i} className="keen-slider__slide relative aspect-[3/1] w-full">
            <Image
              src={src}
              alt={`Banner ${i + 1}`}
              fill
              className="object-cover rounded-md"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Nút trái/phải */}
      {loaded && instanceRef.current && (
        <>
          <button
            onClick={() => instanceRef.current?.prev()}
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/70 hover:bg-white text-black p-2 rounded-full shadow"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => instanceRef.current?.next()}
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/70 hover:bg-white text-black p-2 rounded-full shadow"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dấu chấm */}
      {loaded && instanceRef.current && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              className={`w-2 h-2 rounded-full ${
                currentSlide === idx ? 'bg-black' : 'bg-zinc-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
