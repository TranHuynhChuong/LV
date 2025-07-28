'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { VoucherPromotionOverview } from '@/models/promotionVoucher';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { TicketPercent } from 'lucide-react';
import Link from 'next/link';

type Props = {
  data: VoucherPromotionOverview[];
};

export default function VoucherPromotionsTable({ data }: Readonly<Props>) {
  const columns: ColumnDef<VoucherPromotionOverview>[] = [
    {
      accessorKey: 'id',
      header: 'Mã giảm',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2 rounded-md ">
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
        const now = new Date();
        const from = new Date(item.startAt);
        const canUpdate = from > now;
        return (
          <div className="flex flex-col space-y-1.5">
            <Link
              className="cursor-pointer hover:underline "
              href={`/promotions/vouchers/${item.id}`}
            >
              {canUpdate ? 'Cập nhật' : 'Chi tiết'}
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
      <div className="mt-4 mb-2 overflow-hidden border rounded-md min-w-fit">
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
                <TableCell colSpan={columns.length} className="py-8 text-center">
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
