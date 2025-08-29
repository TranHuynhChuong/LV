'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Promotion } from '@/models/promotion';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { BadgePercent } from 'lucide-react';
import Link from 'next/link';

type Props = {
  data: Promotion[];
  onDelete?: (code: number) => void;
};

export default function BookPromotionsTable({ data }: Readonly<Props>) {
  const columns: ColumnDef<Promotion>[] = [
    {
      accessorKey: 'name',
      header: 'Khuyến mãi',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex gap-4 rounded-md ">
            <div className="flex items-center justify-center w-10 h-10 rounded-sm bg-muted">
              <BadgePercent />
            </div>
            <div className="text-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-sm leading-5 truncate max-w-36 lg:max-w-none">
                      {item.promotionName}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p> {item.promotionName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="text-xs text-muted-foreground">#{item.promotionId}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'totalBooks',
      header: 'Tổng sách',
      cell: ({ row }) => {
        return <div>{row.original.totalQuantity}</div>;
      },
    },
    {
      accessorKey: 'startAt',
      header: 'Bắt đầu',
      cell: ({ row }) => {
        const date = new Date(row.original.startDate).toLocaleString('vi-VN');
        return <div>{date}</div>;
      },
    },
    {
      accessorKey: 'endAt',
      header: 'Kết thúc',
      cell: ({ row }) => {
        const date = new Date(row.original.endDate).toLocaleString('vi-VN');
        return <div>{date}</div>;
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const item = row.original;
        const now = new Date();
        const from = new Date(item.startDate);

        const canUpdate = from > now;

        return (
          <div className="flex flex-col space-y-1.5">
            <Link
              className="cursor-pointer hover:underline "
              href={`/promotions/books/${item.promotionId}`}
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
