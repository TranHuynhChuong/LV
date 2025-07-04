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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';

import { TicketPercent } from 'lucide-react';
import { VoucherPromotionOverview } from '@/models/promotionVoucher';

interface VoucherPromotionsTableProps {
  data: VoucherPromotionOverview[];
  onDelete?: (code: number) => void;
}

export default function VoucherPromotionsTable({
  data,
  onDelete,
}: Readonly<VoucherPromotionsTableProps>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null);

  const columns: ColumnDef<VoucherPromotionOverview>[] = [
    {
      accessorKey: 'id',
      header: 'Mã giảm',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className=" rounded-md flex gap-2 items-center">
            <TicketPercent />
            <div className="text-sm">#{item.id}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Loại',
      cell: ({ row }) => {
        const type = row.original.type;
        const display =
          type === 'vc' ? 'Vận chuyển' : type === 'hd' ? 'Tiền hàng' : 'Không xác định';
        return <div>{display}</div>;
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

        return (
          <div className="flex flex-col space-y-1">
            <Link
              className="cursor-pointer hover:underline"
              href={`/promotions/voucher/${item.id}`}
            >
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
            {table.getRowModel().rows.length ? (
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
    </div>
  );
}
