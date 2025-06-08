'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, RotateCcw, Search } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateRange {
  from: Date | undefined;
  to?: Date;
}

interface ProductPromotionSearchBarProps {
  onApply: (filters: { code?: string; dateRange?: DateRange }) => void;
  onReset: () => void;
}

export function ProductPromotionSearchBar({
  onApply,
  onReset,
}: Readonly<ProductPromotionSearchBarProps>) {
  const [criteria, setCriteria] = useState<'code' | 'date'>('date');
  const [code, setCode] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  const handleApply = () => {
    if (criteria === 'code' && code.trim() !== '') {
      onApply({ code });
    } else if (criteria === 'date' && (dateRange.from || dateRange.to)) {
      onApply({ dateRange });
    }
  };

  const handleReset = () => {
    setCode('');
    setDateRange({ from: undefined, to: undefined });
    onReset();
  };

  return (
    <div className="flex flex-wrap items-center justify-end">
      <div className="flex flex-1 gap-2 my-2">
        {/* Chọn tiêu chí */}
        <Select value={criteria} onValueChange={(value) => setCriteria(value as 'code' | 'date')}>
          <SelectTrigger className="w-54">
            <SelectValue placeholder="Chọn tiêu chí tìm kiếm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="code">Tìm theo mã</SelectItem>
            <SelectItem value="date">Tìm theo khoảng thời gian</SelectItem>
          </SelectContent>
        </Select>

        {/* Input tương ứng */}
        {criteria === 'code' && (
          <Input
            placeholder="Mã khuyến mãi..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 min-w-54"
          />
        )}

        {criteria === 'date' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'flex-1  min-w-54 justify-start text-left font-normal',
                  !dateRange.from && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
                    </>
                  ) : (
                    format(dateRange.from, 'dd/MM/yyyy')
                  )
                ) : (
                  <span>Khoảng thời gian</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => setDateRange(range ?? { from: undefined, to: undefined })}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Nút hành động */}
      <div className="flex gap-2 justify-end ml-8 my-2">
        <Button onClick={handleApply}>
          <Search className="mr-1 w-4 h-4" />
          Tìm kiếm
        </Button>

        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-1 w-4 h-4" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
