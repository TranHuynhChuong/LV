'use client';

import * as React from 'react';
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
import { useRef } from 'react';

interface ComboboxProps {
  readonly data: { code: number; name: string }[] | null;
  readonly type: 'province' | 'ward';
  readonly onSelect: (id: number) => void;
  readonly value?: number;
}

export default function Combobox({ data, type, onSelect, value }: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  // Đồng bộ `value` từ props vào state khi `value` thay đổi
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedId(value);
    }
  }, [value]);

  const selectedItem = data?.find((d) => d.code === selectedId);

  const placeholders = {
    province: {
      select: 'Chọn tỉnh/thành phố...',
      search: 'Nhập tên tỉnh/thành phố...',
      empty: 'Không tìm thấy tỉnh/thành phố.',
    },
    ward: {
      select: 'Chọn xã/phường...',
      search: 'Nhập tên xã/phường...',
      empty: 'Không tìm thấy xã/phường.',
    },
  };

  const ph = placeholders[type];
  const isDisabled = !data || data.length === 0;
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
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
