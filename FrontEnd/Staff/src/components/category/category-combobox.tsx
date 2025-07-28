'use client';

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
import api from '@/lib/axios-client';
import { cn } from '@/lib/utils';
import { Category, CategoryDto } from '@/models/categories';
import { Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  value: number | number[] | null;
  onChange: (ids: number[]) => void;
  onLabelChange?: (labels: string[]) => void;
  excludeId?: number | null;
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
  onLabelChange,
  excludeId,
  className,
}: Readonly<Props>) {
  const [categoriesRaw, setCategoriesRaw] = useState<CategoryDto[] | null>(null);
  useEffect(() => {
    api
      .get('/categories')
      .then((res) => {
        const data = res.data as CategoryDto[];
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
    return treeCategories.filter((c) => selectedIds.includes(c.id ?? 0));
  }, [treeCategories, selectedIds]);
  const calledOnInitRef = useRef(false);

  useEffect(() => {
    if (
      !calledOnInitRef.current &&
      onLabelChange &&
      selectedIds.length > 0 &&
      treeCategories.length > 0
    ) {
      const labels = treeCategories
        .filter((c) => selectedIds.includes(c.id ?? 0))
        .map((c) => c.name);

      onLabelChange(labels);
      calledOnInitRef.current = true;
    }
  }, [selectedIds, treeCategories, onLabelChange]);

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          aria-expanded={open}
          className={`flex flex-wrap items-center justify-start w-full font-normal h-fit px-2.5 cursor-pointer ${
            className ?? ''
          }`}
          disabled={!categoriesRaw}
        >
          {!categoriesRaw ? (
            <Skeleton className="w-24 h-5" />
          ) : selectedCategories.length === 0 ? (
            <span className="cursor-pointer text-zinc-500">Chọn thể loại ... </span>
          ) : (
            selectedCategories.map((c) => (
              <span
                key={c.id}
                className="px-2 text-sm rounded cursor-pointer bg-muted whitespace-nowrap"
              >
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
                  const isSelected = selectedIds.includes(category.id ?? 0);
                  const isDisabled = category.id === excludeId;
                  return (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      disabled={isDisabled}
                      onSelect={() => {
                        let updatedIds: number[];
                        if (isSelected) {
                          updatedIds = selectedIds.filter((id) => id !== category.id);
                        } else {
                          updatedIds = [...selectedIds, category.id ?? 0];
                        }
                        onChange(updatedIds);
                        const updatedLabels = treeCategories
                          .filter((c) => updatedIds.includes(c.id ?? 0))
                          .map((c) => c.name);
                        onLabelChange?.(updatedLabels);
                      }}
                      className="cursor-pointer"
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
