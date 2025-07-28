'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  initalcode: string;
  onApply: (type: string, code?: string) => void;
  onReset: () => void;
};

export function VoucherPromotionSearchBar({ onApply, onReset, initalcode }: Readonly<Props>) {
  const [code, setCode] = useState(initalcode);
  const [type, setType] = useState('all');

  const handleApply = () => {
    if (code.trim() !== '') {
      onApply(type, code.trim());
    } else {
      onApply(type);
    }
  };

  const handleReset = () => {
    setCode('');
    setType('all');
    onReset();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-1 gap-2 my-2">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-40 cursor-pointer">
            <SelectValue placeholder="Loại mã" className="cursor-pointer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              Tất cả
            </SelectItem>
            <SelectItem value="vc" className="cursor-pointer">
              Mã vận chuyển
            </SelectItem>
            <SelectItem value="hd" className="cursor-pointer">
              Mã hóa đơn
            </SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Mã khuyến mãi..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 min-w-54"
        />
      </div>

      <div className="flex justify-end gap-2 my-2">
        <Button onClick={handleApply} className="cursor-pointer">
          <Search className="w-4 h-4 mr-1 " />
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
