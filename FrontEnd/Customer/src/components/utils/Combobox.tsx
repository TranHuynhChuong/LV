'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

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
import { cn } from '@/lib/utils';

interface PlaceholderSet {
  select: string;
  search: string;
  empty: string;
}

type ComboboxProps = {
  data: { code: number; name: string }[] | null;
  onSelect: (id: number) => void;
  value?: number;
  placeholders?: PlaceholderSet;
  error?: boolean;
};

const defaultPlaceholders: PlaceholderSet = {
  select: 'Chọn...',
  search: 'Nhập từ khóa...',
  empty: 'Không tìm thấy kết quả.',
};

export default function Combobox({
  data,
  onSelect,
  value,
  placeholders,
  error,
}: Readonly<ComboboxProps>) {
  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedId(value);
    }
  }, [value]);

  const selectedItem = data?.find((d) => d.code === selectedId);

  const ph = placeholders ?? defaultPlaceholders;

  const isDisabled = !data || data.length === 0;
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-between w-full font-normal',
            !selectedItem && 'text-muted-foreground',
            error && ' border-red-600 ring-red-600 focus:ring-red-600 focus:border-red-600'
          )}
          disabled={isDisabled}
        >
          {selectedItem ? selectedItem.name : ph.select}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      {!isDisabled && (
        <PopoverContent className="p-0" style={{ width: triggerRef.current?.offsetWidth }}>
          <Command>
            <CommandInput placeholder={ph.search} />
            <CommandList>
              <CommandEmpty>{ph.empty}</CommandEmpty>
              <CommandGroup>
                {data.map((item) => (
                  <CommandItem
                    key={item.code}
                    value={item.name}
                    onSelect={() => {
                      setSelectedId(item.code);
                      setOpen(false);
                      onSelect(item.code);
                    }}
                    className="text-sm cursor-pointer"
                  >
                    {item.name}
                    <Check
                      className={cn(
                        'ml-auto',
                        selectedId === item.code ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
}
