'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { StaffFormData } from './staffForm';
interface CustomerTableProps {
  data: StaffFormData[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
}
export default function StaffTable({ data, isLoading, onDelete }: Readonly<CustomerTableProps>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  const columns: ColumnDef<StaffFormData>[] = [
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
      accessorKey: 'role',
      header: 'Vai trò',
      enableHiding: false,
      enableColumnFilter: true,
      cell: ({ row }) => <div>{row.getValue('role')}</div>,
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
          <div className="flex flex-col space-y-1">
            <Link className="cursor-pointer hover:underline" href={`/accounts/staffs/${staff.id}`}>
              Cập nhật
            </Link>

            <button
              className="cursor-pointer hover:underline w-fit"
              onClick={() => {
                setDeleteDialogOpen(staff.id ?? null);
              }}
            >
              Xóa
            </button>
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
    <>
      <div className="w-full">
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <span className="pl-2 font-medium text-lg">{data.length} Nhân viên</span>
            <Link href="accounts/new">
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
                table.getColumn('role')?.setFilterValue(value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Quản trị">Quản trị</SelectItem>
                <SelectItem value="Quản lý">Quản lý</SelectItem>
                <SelectItem value="Bán hàng">Bán hàng</SelectItem>
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
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((col, i) => (
                      <TableCell key={i}>
                        <Skeleton className="w-full h-4"></Skeleton>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="cursor-pointer even:bg-muted">
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

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialogOpen !== null}
        onOpenChange={(open) => !open && setDeleteDialogOpen(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn có chắc muốn xóa?</DialogTitle>
          </DialogHeader>
          <div className="w-full h-10"></div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteDialogOpen !== null) {
                  onDelete?.(deleteDialogOpen);
                  setDeleteDialogOpen(null);
                }
              }}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
