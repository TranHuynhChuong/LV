'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/axiosClient';

type BackendCategory = {
  TL_id: number;
  TL_ten: string;
  TL_idTL: number | null;
};

type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

type CategoryComboboxProps = {
  value: number | null;
  onChange: (id: number | null) => void;
  excludeId?: number | null;
};

function buildTreeData(
  categories: Category[],
  parentId: number | null = null,
  depth = 0
): (Category & { depth: number })[] {
  return categories
    .filter((c) => c.parentId === parentId)
    .flatMap((c) => [{ ...c, depth }, ...buildTreeData(categories, c.id, depth + 1)]);
}

export function CategoryCombobox({ value, onChange, excludeId }: CategoryComboboxProps) {
  const [categoriesRaw, setCategoriesRaw] = useState<BackendCategory[] | null>(null);

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => {
        const data = res.data as BackendCategory[];
        setCategoriesRaw(data.length > 0 ? data : []);
      })
      .catch(() => {
        setCategoriesRaw([]);
      });
  }, []);

  const flatCategories: Category[] = useMemo(() => {
    if (!categoriesRaw) return [];
    return categoriesRaw.map(({ TL_id, TL_ten, TL_idTL }) => ({
      id: TL_id,
      name: TL_ten,
      parentId: TL_idTL,
    }));
  }, [categoriesRaw]);

  const treeCategories = useMemo(() => {
    return buildTreeData(flatCategories).map((cat) => ({
      ...cat,
      isLeaf: !flatCategories.some((c) => c.parentId === cat.id),
    }));
  }, [flatCategories]);

  const [open, setOpen] = useState(false);
  const selectedCategory = treeCategories.find((c) => c.id === value);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-full font-normal"
          disabled={!categoriesRaw} // disable button khi chưa có data
        >
          {!categoriesRaw ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            selectedCategory?.name || 'Chọn thể loại cha...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: triggerRef.current?.offsetWidth }}>
        {!categoriesRaw ? (
          <div className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <Command>
            <CommandInput placeholder="Nhập tên thể loại..." />
            <CommandList>
              <CommandEmpty>No category found.</CommandEmpty>
              <CommandGroup>
                {treeCategories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    disabled={category.id === excludeId}
                    onSelect={() => {
                      onChange(category.id === value ? null : category.id);
                      setOpen(false);
                    }}
                  >
                    <span style={{ paddingLeft: `${category.depth * 1.25}rem` }}>
                      {category.name}
                    </span>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        value === category.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
