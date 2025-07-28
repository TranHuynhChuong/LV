'use client';

import { Button } from '@/components/ui/button';
import { RotateCcw, Search } from 'lucide-react';
import { FC, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import DateRangePicker from '../utils/date-range-picker';

type Props = {
  initialRating?: number;
  initialDateRange?: { from: Date | undefined; to: Date | undefined };
  onApply: (filters: { rating?: number; daterange?: { from: Date; to: Date } }) => void;
  onReset: () => void;
};

export const ReviewSearchBar: FC<Props> = ({
  initialRating,
  initialDateRange,
  onApply,
  onReset,
}) => {
  const [rating, setRating] = useState<string>(initialRating?.toString() ?? 'all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(initialDateRange);
  const handleSearch = () => {
    const parsedRating = rating === 'all' ? undefined : parseInt(rating);
    onApply({
      rating: parsedRating,
      daterange:
        dateRange?.from && dateRange?.to ? { from: dateRange.from, to: dateRange.to } : undefined,
    });
  };

  const handleReset = () => {
    setRating('all');
    setDateRange(undefined);
    onReset();
  };

  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="flex flex-wrap items-center gap-4 ">
        <div className="flex items-center gap-3">
          <Label className="block mb-1 text-sm">Điểm đánh giá</Label>
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

        <div className="flex items-center gap-3">
          <Label className="block mb-1 text-sm whitespace-nowrap">Khoảng thời gian</Label>
          <DateRangePicker date={dateRange} onChange={setDateRange} />
        </div>
      </div>

      <div className="flex justify-end flex-1 gap-2">
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
