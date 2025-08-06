'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw, Search } from 'lucide-react';
import { useState } from 'react';

type Props = {
  initalcode: string;
  onApply: (code: string) => void;
  onReset: () => void;
};

export function OrderSearchBar({ onApply, onReset, initalcode }: Readonly<Props>) {
  const [code, setCode] = useState(initalcode);

  const handleApply = () => {
    const trimmed = code.trim();
    if (trimmed !== '') {
      onApply(trimmed);
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
          placeholder="Mã đơn hàng..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 min-w-54"
        />
      </div>
      <div className="flex justify-end gap-2 my-2 ml-8">
        <Button onClick={handleApply} className="cursor-pointer">
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
}
