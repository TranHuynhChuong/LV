'use client';

import { useState } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import PaginationControls from '@/components/PaginationControls';
import { ProductPromotionSimple } from '../page';
import { BadgePercent } from 'lucide-react';

interface ProductPromotionsTableProps {
  data: ProductPromotionSimple[];
  loading?: boolean;
  onDelete?: (code: number) => void;
  total: number;
  pagination: number[];
  totalPage: number;
  page: number;
  onPageChange: (page: number) => void;
}

export default function ProductPromotionsTable({
  data,
  loading = false,
  onDelete,
  pagination,
  totalPage,
  page,
  onPageChange,
}: Readonly<ProductPromotionsTableProps>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null);

  const columns: ColumnDef<ProductPromotionSimple>[] = [
    {
      accessorKey: 'name',
      header: 'Khuyến mãi',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className=" rounded-md flex gap-4">
            <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center">
              <BadgePercent />
            </div>
            <div className="text-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-sm leading-5 truncate max-w-36 lg:max-w-none">
                      {item.name}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p> {item.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="text-xs text-muted-foreground">#{item.id}</div>
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: 'startAt',
      header: 'Bắt đầu',
      cell: ({ row }) => {
        const date = new Date(row.original.startAt).toLocaleString('vi-VN');
        return <div>{date}</div>;
      },
    },

    {
      accessorKey: 'endAt',
      header: 'Kết thúc',
      cell: ({ row }) => {
        const date = new Date(row.original.endAt).toLocaleString('vi-VN');
        return <div>{date}</div>;
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const item = row.original;
        const date = new Date();
        return (
          <div className="flex flex-col space-y-1">
            <Link className="cursor-pointer hover:underline" href={`/promotions/${item.id}`}>
              {new Date(item.endAt) > date && new Date(item.startAt) < date
                ? 'Chi tiết'
                : 'Cập nhật'}
            </Link>

            {!(new Date(item.endAt) > date && new Date(item.startAt) < date) && (
              <button
                className="cursor-pointer hover:underline w-fit"
                onClick={() => {
                  setDeleteDialogOpen(item.id ?? null);
                }}
              >
                Xóa
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="border rounded-md mt-4 min-w-fit mb-2 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="w-5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Dialog xác nhận xóa */}
        <Dialog
          open={deleteDialogOpen !== null}
          onOpenChange={(open) => !open && setDeleteDialogOpen(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bạn có chắc muốn xóa?</DialogTitle>
            </DialogHeader>
            <DialogDescription>Thao tác này sẽ không thể hoàn tác.</DialogDescription>
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
      </div>

      <div className="my-4">
        <PaginationControls
          pagination={pagination}
          totalPage={totalPage}
          currentPage={page}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
