'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CategoryCombobox from '@/components/CategoriesCombobox';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw, Search } from 'lucide-react';

type Props = {
  searchType: 'id' | 'keyword' | undefined;
  keyword?: string;
  categoryId?: string;
  onApply: (data: {
    type: 'id' | 'keyword';
    keyword?: string;
    productId?: string;
    categoryId?: string;
  }) => void;
  onReset: () => void;
  isSearching: boolean;
};

export default function ProductSearchBar({
  searchType = 'keyword',
  keyword: initialKeyword = '',
  categoryId: initialCategoryId = '',
  onApply,
  onReset,
  isSearching,
}: Readonly<Props>) {
  const [type, setType] = useState<'id' | 'keyword'>(searchType);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [categoryId, setCategoryId] = useState<string>(initialCategoryId);

  useEffect(() => {
    setKeyword(initialKeyword);
    setCategoryId(initialCategoryId);

    if (searchType === 'id') {
      setType('id');
    } else {
      setType('keyword');
    }
  }, []);

  const handleApply = () => {
    if (type === 'id') {
      onApply({ type: 'id', keyword: keyword });
    } else {
      const trimmed = keyword.trim();
      if (!trimmed && categoryId === undefined) return;
      onApply({
        type: 'keyword',
        keyword: trimmed || undefined,
        categoryId,
      });
    }
  };

  const handleReset = () => {
    setKeyword('');
    setCategoryId('');
    if (onReset) onReset();
  };

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        handleApply();
      }}
    >
      <div className="flex items-center justify-between flex-1 space-x-4">
        <Select
          value={type}
          defaultValue={type}
          onValueChange={(val) => setType(val as 'id' | 'keyword')}
        >
          <SelectTrigger className="w-42 text-sm">
            <SelectValue placeholder="Chọn tiêu chí" />
          </SelectTrigger>
          <SelectContent className="text-sm cursor-pointer">
            <SelectItem value="id">Mã sản phẩm</SelectItem>
            <SelectItem value="keyword">Từ khóa | Thể loại</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2 cursor-pointer">
          <Button onClick={handleApply} disabled={isSearching} className="cursor-pointer">
            <Search className="mr-1 w-4 h-4" />
            Tìm kiếm
          </Button>
          <Button variant="outline" className="cursor-pointer" onClick={handleReset}>
            <RotateCcw className="mr-1 w-4 h-4" />
            Đặt lại
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-1">
        <Input
          placeholder={type === 'keyword' ? 'Nhập từ khóa ...' : 'Nhập mã sản phẩm'}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 text-sm"
        />
        {type === 'keyword' && (
          <div className="flex-1">
            <CategoryCombobox
              value={categoryId && !isNaN(Number(categoryId)) ? Number(categoryId) : null}
              onChange={(val: number[]) => setCategoryId(val[0] ? val[0].toString() : '')}
              leafOnly
            />
          </div>
        )}
      </div>
    </form>
  );
}
