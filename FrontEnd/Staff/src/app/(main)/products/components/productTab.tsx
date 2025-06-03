'use client';

import React, { useState } from 'react';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { ProductSimple } from '@/type/Product';

interface ProductTableProps {
  data: ProductSimple[];
  loading?: boolean;
  onEdit?: (row: ProductSimple) => void;
  onDelete?: (code: number) => void;
}

export default function ProductTable({
  data,
  loading = false,
  onDelete,
}: Readonly<ProductTableProps>) {
  const [deleteCode, setDeleteCode] = useState<number | null>(null);

  const columns: ColumnDef<ProductSimple>[] = [
    {
      accessorKey: 'name',
      header: 'Sản phẩm',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className=" rounded-sm flex gap-4 pl-2">
            <Avatar className="w-10 h-12 rounded-xs">
              <AvatarImage src={product.image} alt={product.name} />
              <AvatarFallback>#{product.id}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild className="cursor-pointer">
                    <div className="font-semibold text-sm leading-5 truncate max-w-36 lg:max-w-none">
                      {product.name}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p> {product.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="text-xs text-muted-foreground">#{product.id}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'stock',
      header: 'Số lượng',
      cell: ({ row }) => <div>{row.getValue('stock')}</div>,
    },
    {
      accessorKey: 'price',
      header: 'Giá bán',
      cell: ({ row }) => (
        <div>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(row.getValue('price'))}
        </div>
      ),
    },
    {
      accessorKey: 'sold',
      header: 'Đã bán',
      cell: ({ row }) => <div>{row.getValue('sold')}</div>,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex flex-col space-y-1">
            <Link className="cursor-pointer hover:underline" href={`/products/${product.id}`}>
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
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="border rounded-md mt-4">
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
              <TableCell colSpan={columns.length} className="text-center py-8">
                Không có dữ liệu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={deleteCode !== null} onOpenChange={() => setDeleteCode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn có chắc muốn xóa sản phẩm?</DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteCode(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteCode !== null) onDelete?.(deleteCode);
                setDeleteCode(null);
              }}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
