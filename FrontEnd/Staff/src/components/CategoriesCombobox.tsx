'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Check } from 'lucide-react';
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
  value: number | number[] | null;
  onChange: (ids: number[]) => void;
  excludeId?: number | null;
  leafOnly?: boolean;
  className?: string;
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

export default function CategoryCombobox({
  value,
  onChange,
  excludeId,
  className,
  leafOnly = false,
}: Readonly<CategoryComboboxProps>) {
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

  const selectedIds = useMemo(() => {
    if (value === null) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const selectedCategories = useMemo(() => {
    return treeCategories.filter((c) => selectedIds.includes(c.id));
  }, [treeCategories, selectedIds]);

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          aria-expanded={open}
          className={`flex flex-wrap items-center justify-start w-full font-normal h-fit px-2.5 ${
            className ?? ''
          }`}
          disabled={!categoriesRaw}
        >
          {!categoriesRaw ? (
            <Skeleton className="w-24 h-5" />
          ) : selectedCategories.length === 0 ? (
            <span className="text-zinc-500">Chọn thể loại ... </span>
          ) : (
            selectedCategories.map((c) => (
              <span key={c.id} className="px-2 bg-muted rounded text-sm whitespace-nowrap">
                {c.name}
              </span>
            ))
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 min-w-fit" style={{ width: triggerRef.current?.offsetWidth }}>
        {!categoriesRaw ? (
          <div className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-full h-5 rounded-md" />
            ))}
          </div>
        ) : (
          <Command>
            <CommandInput placeholder="Nhập tên thể loại..." />
            <CommandList>
              <CommandEmpty>Không tìm thấy thể loại nào.</CommandEmpty>
              <CommandGroup>
                {treeCategories.map((category) => {
                  const isSelected = selectedIds.includes(category.id);
                  const isDisabled = category.id === excludeId || (leafOnly && !category.isLeaf);
                  return (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      disabled={isDisabled}
                      onSelect={() => {
                        if (!leafOnly) {
                          // Chọn 1, nếu chọn lại thì bỏ chọn
                          if (isSelected) {
                            onChange([]);
                          } else {
                            onChange([category.id]);
                          }
                          setOpen(false);
                        } else {
                          // Chọn nhiều, toggle chọn/bỏ chọn
                          if (isSelected) {
                            onChange(selectedIds.filter((id) => id !== category.id));
                          } else {
                            onChange([...selectedIds, category.id]);
                          }
                        }
                      }}
                    >
                      <span
                        style={{ paddingLeft: `${category.depth * 1.25}rem` }}
                        className=" whitespace-nowrap"
                      >
                        {category.name}
                      </span>

                      <Check
                        className={cn('ml-auto h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
