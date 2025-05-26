'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  parentId?: string | null;
};

type Props = {
  categories: Category[];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
};

export default function CategoryList({ categories, selectedId, onSelect }: Props) {
  const parentCategories = categories.filter((c) => !c.parentId);
  const getChildren = (id: string) => categories.filter((c) => c.parentId === id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Select Category</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start">
        {/* Thêm lựa chọn "None" để bỏ chọn parent */}
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            onSelect?.(null);
          }}
          className={selectedId === null ? 'bg-gray-200' : ''}
        >
          None
        </DropdownMenuItem>

        {parentCategories.map((parent) => {
          const children = getChildren(parent.id);
          if (children.length === 0) {
            return (
              <DropdownMenuItem
                key={parent.id}
                onSelect={(event) => {
                  event.preventDefault();
                  onSelect?.(parent.id);
                }}
                className={selectedId === parent.id ? 'bg-gray-200' : ''}
              >
                {parent.name}
              </DropdownMenuItem>
            );
          }
          return (
            <DropdownMenuSub key={parent.id}>
              <DropdownMenuSubTrigger>
                {parent.name}
                <ChevronRight className="ml-auto h-4 w-4" />
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {children.map((child) => (
                  <DropdownMenuItem
                    key={child.id}
                    onSelect={(event) => {
                      event.preventDefault();
                      onSelect?.(child.id);
                    }}
                    className={selectedId === child.id ? 'bg-gray-200' : ''}
                  >
                    {child.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
