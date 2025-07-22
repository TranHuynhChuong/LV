'use client';

import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';

export default function SearchInput() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const key = searchParams.get('k') ?? '';
  const [value, setValue] = useState(key);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setValue(key);
  }, [key]);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed !== '' && isFocused) {
      const localTimeout = setTimeout(() => {
        api
          .get(`/products/suggestions`, { params: { keyword: trimmed, limit: 10 } })
          .then((res) => res.data)
          .then((data: string[]) => setSuggestions(data))
          .catch(() => setSuggestions([]));
      }, 300);

      return () => clearTimeout(localTimeout);
    } else {
      setSuggestions([]);
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSearch = (keyword?: string) => {
    const trimmed = (keyword ?? value).trim();
    if (trimmed) {
      const newParams = new URLSearchParams();
      newParams.set('k', trimmed);
      newParams.set('p', '1');
      newParams.set('s', '1');
      router.push(`/search?${newParams.toString()}`);
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setValue('');
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
  };

  return (
    <div className="relative w-full">
      <Button className="absolute  top-1/2 -translate-y-1/2 text-muted-foreground rounded-r-none">
        <Search color="white" />
      </Button>

      {value && (
        <X
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 cursor-pointer hover:text-foreground"
        />
      )}
      <Input
        type="text"
        className="pl-12 pr-9 w-full"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Tìm kiếm..."
        autoComplete="off"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 100)} // delay để click chọn suggestion
      />
      {isFocused && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full text-xs text-muted-foreground bg-white border rounded shadow max-h-60 overflow-auto">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              onClick={() => handleSuggestionClick(s)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
