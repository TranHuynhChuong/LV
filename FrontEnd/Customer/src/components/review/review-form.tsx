'use client';

import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export interface BookReviewFormProps {
  bookImage: string;
  bookName: string;
  initialRating?: number;
  initialContent?: string;
  onChange: (rating: number, content: string) => void;
}

export default function BookReviewForm({
  bookImage,
  bookName,
  initialRating = 5,
  initialContent = '',
  onChange,
}: Readonly<BookReviewFormProps>) {
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
    <div className="p-4 space-y-4 bg-white border rounded-md">
      <div className="flex gap-4">
        <Image
          src={bookImage}
          alt={bookName}
          width={64}
          height={64}
          className="object-cover border rounded-md"
        />
        <div className="text-sm font-medium">{bookName}</div>
      </div>

      {/* Chọn sao */}
      <div className="flex items-center gap-1">
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
        <span className="ml-2 text-sm">({rating}/5)</span>
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
        <div className="mt-2 text-xs text-right text-muted-foreground">
          {content.length}/1000 ký tự
        </div>
      </div>
    </div>
  );
}
