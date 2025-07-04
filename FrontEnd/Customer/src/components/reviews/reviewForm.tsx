'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export interface ProductReviewFormProps {
  productImage: string;
  productName: string;
  initialRating?: number;
  initialContent?: string;
  onChange: (rating: number, content: string) => void;
}

export default function ProductReviewForm({
  productImage,
  productName,
  initialRating = 5,
  initialContent = '',
  onChange,
}: Readonly<ProductReviewFormProps>) {
  const [rating, setRating] = useState(initialRating);
  const [hovered, setHovered] = useState<number | null>(null);
  const [content, setContent] = useState(initialContent);

  const handleRatingChange = (value: number) => {
    setRating(value);
    onChange(value, content.trim());
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    onChange(rating, value);
  };

  return (
    <div className="space-y-4 border rounded-md p-4 bg-white">
      {/* Thông tin sản phẩm */}
      <div className="flex gap-4">
        <Image
          src={productImage}
          alt={productName}
          width={64}
          height={64}
          className="rounded-md border object-cover"
        />
        <div className="font-medium text-sm">{productName}</div>
      </div>

      {/* Chọn sao */}
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            onClick={() => handleRatingChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            className={`cursor-pointer transition-colors ${
              (hovered ?? rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm ml-2">({rating}/5)</span>
      </div>

      {/* Nội dung đánh giá */}
      <div>
        <Textarea
          value={content}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 1000) {
              handleContentChange(value);
            }
          }}
          className="h-32"
          placeholder="Nhập cảm nhận về sản phẩm..."
          rows={4}
        />
        <div className="text-xs text-muted-foreground text-right mt-2">
          {content.length}/1000 ký tự
        </div>
      </div>
    </div>
  );
}
