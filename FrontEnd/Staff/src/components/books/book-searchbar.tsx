'use client';

import CategoryCombobox from '@/components/category/category-combobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  }, [initialKeyword, initialCategoryId, searchType]);

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
          <SelectTrigger className="text-sm cursor-pointer w-42">
            <SelectValue placeholder="Chọn tiêu chí" className="cursor-pointer" />
          </SelectTrigger>
          <SelectContent className="text-sm cursor-pointer">
            <SelectItem value="id" className="cursor-pointer">
              Mã ISBN
            </SelectItem>
            <SelectItem value="keyword" className="cursor-pointer">
              Từ khóa | Thể loại
            </SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2 cursor-pointer">
          <Button onClick={handleApply} disabled={isSearching} className="cursor-pointer">
            <Search className="w-4 h-4 mr-1" />
            Tìm kiếm
          </Button>
          <Button variant="outline" className="cursor-pointer" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Đặt lại
          </Button>
        </div>
      </div>
      <div className="flex items-center flex-1 space-x-2">
        <Input
          placeholder={type === 'keyword' ? 'Nhập từ khóa ...' : 'Nhập mã isbn sản phẩm'}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 text-sm"
        />
        {type === 'keyword' && (
          <div className="flex-1">
            <CategoryCombobox
              value={categoryId && !isNaN(Number(categoryId)) ? Number(categoryId) : null}
              onChange={(val: number[]) => setCategoryId(val[0] ? val[0].toString() : '')}
            />
          </div>
        )}
      </div>
    </form>
  );
}
