'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import EventBus from '@/lib/event-bus';
import { Category } from '@/models/category';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import DeleteActionCell from '../utils/delete-action-cell';

function getAllChildrenIds(parentId: number, categories: Category[]): number[] {
  const result: number[] = [];
  const stack: number[] = [parentId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    result.push(current);
    const children = categories.filter((cat) => cat.parentId === current);
    for (const child of children) {
      if (typeof child.categoryId === 'number') {
        stack.push(child.categoryId);
      }
    }
  }
  return result;
}

type Props = {
  data: Category[];
  levelOptions: number[];
};

export default function CategoryTable({ data, levelOptions }: Readonly<Props>) {
  const { authData } = useAuth();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'categoryId',
      header: 'Mã',
      cell: ({ row }) => <div className="pl-3">{row.getValue('categoryId')}</div>,
      enableHiding: false,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        return filterValue.includes(row.getValue(columnId));
      },
    },
    {
      accessorKey: 'name',
      header: 'Tên',
      enableHiding: false,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'level',
      header: 'Cấp',
      enableColumnFilter: true,
      filterFn: 'equals',
      cell: ({ row }) => <div className="text-center">{row.getValue('level')}</div>,
    },
    {
      accessorKey: 'childrenCount',
      header: 'SL thể loại con',
      cell: ({ row }) => <div className="text-center">{row.getValue('childrenCount')}</div>,
      enableHiding: false,
    },
    {
      accessorKey: 'parent',
      header: 'Thể loại cha',
      enableHiding: false,
    },
    {
      id: 'actions',
      enableHiding: false,
      header: 'Thao tác',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col items-start space-y-1">
            <Link
              className="cursor-pointer hover:underline"
              href={`/categories/${item.categoryId}`}
            >
              Cập nhật
            </Link>
            <DeleteActionCell
              resourceId={item.categoryId?.toString()}
              onDelete={async (id) => {
                await api.delete(`/categories/${id}?staffId=${authData.userId}`);
                EventBus.emit('category:refetch');
              }}
              onError={(error) => {
                if (error === 409) toast.error('Không thể xóa do ràng buộc dữ liệu!');
                else toast.error('Xóa thất bại!');
              }}
            />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 24,
      },
    },
  });

  return (
    <div className="p-4">
      <div className="w-full p-4 bg-white rounded-md shadow-sm h-fit min-w-fit">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center pl-4 space-x-2">
            <span className="text-xl font-semibold">{data.length ?? 0}</span>
            <span>Thể loại</span>
          </div>
          <Link href="/categories/new">
            <Button className="cursor-pointer">
              <Plus /> Thêm mới
            </Button>
          </Link>
        </div>
        <div className="flex gap-4 mb-4">
          <Select
            onValueChange={(value) => {
              table.getColumn('level')?.setFilterValue(value === 'all' ? undefined : Number(value));
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả cấp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cấp</SelectItem>
              {levelOptions.map((level) => (
                <SelectItem key={level} value={String(level)}>
                  Cấp {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => {
              const column = table.getColumn('categoryId');
              if (!column) return;
              column.setFilterValue(
                value === '0' ? undefined : getAllChildrenIds(Number(value), data)
              );
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tất cả thể loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Tất cả thể loại</SelectItem>
              {data.map((cat) => (
                <SelectItem key={cat.categoryId} value={String(cat.categoryId)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Tìm theo tên thể loại..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            className="w-full max-w-sm"
          />
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={headerGroup.headers[0].id === header.id ? 'pl-4' : ''}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {'Không có kết quả.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end py-4 space-x-2">
          <div className="flex-1 pl-3 text-sm text-muted-foreground">
            Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
