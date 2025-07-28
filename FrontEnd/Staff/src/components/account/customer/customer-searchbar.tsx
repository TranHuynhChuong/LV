'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Props = {
  initialValue: string;
};

export default function CustomerSearchbar({ initialValue }: Readonly<Props>) {
  const [inputEmail, setInputEmail] = useState(initialValue);
  const router = useRouter();

  const handleApplySearch = () => {
    if (inputEmail.trim()) {
      router.replace(`/accounts/customers?email=${inputEmail.trim()}&page=1`);
    }
  };

  const handleClearSearch = () => {
    router.replace(`/accounts/customers?page=1`);
  };

  useEffect(() => {
    setInputEmail(initialValue);
  }, [initialValue]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-4">
      <Input
        placeholder="Tìm theo email..."
        value={inputEmail}
        onChange={(e) => setInputEmail(e.target.value)}
        className="max-w-sm"
      />
      <div className="flex gap-2">
        <Button onClick={handleApplySearch} className="cursor-pointer">
          <Search className="w-4 h-4 mr-1" />
          Tìm kiếm
        </Button>
        <Button variant="outline" onClick={handleClearSearch} className="cursor-pointer">
          <RotateCcw className="w-4 h-4 mr-1" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
