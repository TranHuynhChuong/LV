'use client';

import { FC, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

type Props = {
  initialRating?: number;
  initialDate?: Date;
  onApply: (filters: { rating?: number; date?: Date }) => void;
  onReset: () => void;
};

export const ReviewSearchBar: FC<Props> = ({ initialRating, initialDate, onApply, onReset }) => {
  const [rating, setRating] = useState<string>(initialRating?.toString() ?? 'all');
  const [date, setDate] = useState<string>(
    initialDate ? initialDate.toISOString().split('T')[0] : ''
  );

  const handleSearch = () => {
    const parsedRating = rating === 'all' ? undefined : parseInt(rating);
    const parsedDate = date ? new Date(date) : undefined;
    onApply({ rating: parsedRating, date: parsedDate });
  };

  const handleReset = () => {
    setRating('');
    setDate('');
    onReset();
  };

  return (
    <div className="flex flex-wrap items-end gap-6 justify-between">
      <div className="flex items-center gap-4 flex-wrap ">
        <div className="flex gap-3 items-center">
          <Label className="block text-sm mb-1">Điểm đánh giá</Label>
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger className="w-[180px] cursor-pointer">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {[5, 4, 3, 2, 1].map((s) => (
                <SelectItem key={s} value={s.toString()}>
                  {s} sao
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 items-center">
          <Label className="block text-sm mb-1 whitespace-nowrap">Ngày đánh giá</Label>
          <Input
            className="cursor-pointer"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 flex-1 justify-end">
        <Button onClick={handleSearch} className="cursor-pointer">
          <Search className="w-4 h-4 mr-1" />
          Tìm kiếm
        </Button>
        <Button variant="outline" onClick={handleReset} className="cursor-pointer">
          <RotateCcw className="w-4 h-4 mr-1" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
};
