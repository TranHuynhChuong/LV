'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw, Search } from 'lucide-react';

type BookPromotionSearchBarProps = {
  initalcode: string;
  onApply: (code: string) => void;
  onReset: () => void;
};

export function BookPromotionSearchBar({
  onApply,
  onReset,
  initalcode,
}: Readonly<BookPromotionSearchBarProps>) {
  const [code, setCode] = useState(initalcode);
  const handleApply = () => {
    if (code !== '') {
      onApply(code);
    }
  };

  const handleReset = () => {
    setCode('');
    onReset();
  };

  return (
    <div className="flex flex-wrap items-center justify-end">
      <div className="flex flex-1 gap-2 my-2">
        <Input
          placeholder="Mã khuyến mãi..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 min-w-54"
        />
      </div>
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
