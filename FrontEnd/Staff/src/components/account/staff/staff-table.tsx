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
import { Staff } from '@/models/accounts';
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
import { ArrowUpDown, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
  data: Staff[];
};

export default function StaffTable({ data }: Readonly<Props>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const columns: ColumnDef<Staff>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Mã <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
      enableHiding: false,
      cell: ({ row }) => <div className="pl-3">{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'roleName',
      header: 'Vai trò',
      enableHiding: false,
      enableColumnFilter: true,
      cell: ({ row }) => <div>{row.getValue('roleName')}</div>,
    },
    {
      accessorKey: 'isBlock',
      header: 'Trạng thái',
      enableHiding: false,
      enableColumnFilter: true,
      cell: ({ row }) => <div>{row.getValue('isBlock') ? 'Khóa' : 'Hoạt động'}</div>,
    },
    {
      accessorKey: 'fullName',
      header: 'Họ tên',
      enableHiding: false,
      cell: ({ row }) => <div>{row.getValue('fullName')}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableHiding: false,
      cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'phone',
      header: 'Số điện thoại',
      enableHiding: false,
      cell: ({ row }) => <div>{row.getValue('phone')}</div>,
    },
    {
      id: 'actions',
      enableHiding: false,
      header: 'Thao tác',
      cell: ({ row }) => {
        const staff = row.original;
        return (
          <div className="flex flex-col items-start space-y-1">
            <Link className="cursor-pointer hover:underline" href={`/accounts/staffs/${staff.id}`}>
              Cập nhật
            </Link>
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
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
    <div className="w-full">
      <div className="py-4 space-y-4">
        <div className="flex items-center justify-end">
          <Link href="/accounts/staffs/new">
            <Button className="cursor-pointer">
              <Plus /> Thêm mới
            </Button>
          </Link>
        </div>
        <div className="flex space-x-4">
          <Input
            placeholder="Tìm theo mã..."
            value={(table.getColumn('id')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('id')?.setFilterValue(event.target.value)}
            className="w-full max-w-sm text-sm"
          />
          <Select
            onValueChange={(value) =>
              table.getColumn('roleName')?.setFilterValue(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-[180px] cursor-pointer">
              <SelectValue placeholder="Vai trò" className="cursor-pointer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                Tất cả
              </SelectItem>
              <SelectItem value="Quản trị" className="cursor-pointer">
                Quản trị
              </SelectItem>
              <SelectItem value="Quản lý" className="cursor-pointer">
                Quản lý
              </SelectItem>
              <SelectItem value="Bán hàng" className="cursor-pointer">
                Bán hàng
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) =>
              table
                .getColumn('isBlock')
                ?.setFilterValue(value === 'all' ? undefined : value === 'true')
            }
          >
            <SelectTrigger className="w-[200px] cursor-pointer">
              <SelectValue placeholder="Trạng thái hoạt động" className="cursor-pointer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                Tất cả
              </SelectItem>
              <SelectItem value="true" className="cursor-pointer">
                Khóa
              </SelectItem>
              <SelectItem value="false" className="cursor-pointer">
                Hoạt động
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="border rounded-md">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
  );
}
