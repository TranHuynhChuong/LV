'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PaginationControls from '@/components/utils/pagination-controls';
import { Book } from '@/models/book';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import DeleteActionCell from '../utils/delete-action-cell';

type Props = {
  data: Book[];
  loading?: boolean;
  onDelete?: (code: number) => void;
  isComponent: boolean;
  total: number;
  pageNumbers: number[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onClose?: () => void;
  selectedData?: Book[];
  onConfirmSelect?: (selecData: Book[]) => void;
};

export default function BookTable({
  data,
  selectedData,
  loading = false,
  onDelete,
  isComponent = false,
  total,
  pageNumbers,
  totalPages,
  currentPage,
  onPageChange,
  onClose,
  onConfirmSelect,
}: Readonly<Props>) {
  const [rowSelection, setRowSelection] = useState({});
  const [selectData, setSelectData] = useState<Book[]>([]);

  let columns: ColumnDef<Book>[] = [
    {
      accessorKey: 'title',
      header: 'Sách',
      cell: ({ row }) => {
        const book = row.original;
        return (
          <div className="flex gap-4 rounded-sm ">
            <Avatar className="h-12 w-fit rounded-xs">
              <AvatarImage
                src={
                  typeof book.images === 'string'
                    ? book.images
                    : Array.isArray(book.images)
                    ? book.images.find((img) => img.isCover)?.url ?? book.images[0]?.url
                    : 'icon.png'
                }
                alt={book.title}
              />
              <AvatarFallback>#{book.bookId}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-sm leading-5 truncate max-w-36 lg:max-w-90 ">
                      {book.title}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p> {book.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="mt-1 text-xs text-muted-foreground">#{book.isbn}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'inventory',
      header: 'Số lượng',
      cell: ({ row }) => <div>{row.getValue('inventory')}</div>,
    },
    {
      accessorKey: 'sold',
      header: 'Đã bán',
      cell: ({ row }) => <div>{row.getValue('sold')}</div>,
    },
    {
      accessorKey: 'sellingPrice',
      header: 'Giá bán',
      cell: ({ row }) => (
        <div>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(row.getValue('sellingPrice'))}
        </div>
      ),
    },
    {
      accessorKey: 'importPrice',
      header: !isComponent ? undefined : 'Giá nhập',
      enableHiding: false,
      cell: ({ row }) => {
        if (!isComponent) return undefined;
        const value = row.getValue<number>('importPrice');
        return (
          <div>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(value)}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: isComponent ? undefined : 'Thao tác',
      cell: ({ row }) => {
        if (isComponent) return undefined;
        const book = row.original;
        return (
          <div className="flex flex-col items-start space-y-1">
            <Link className="cursor-pointer hover:underline" href={`/books/${book.bookId}`}>
              Cập nhật
            </Link>
            {book.status === 'An' && (
              <DeleteActionCell
                resourceId={book.bookId?.toString()}
                onDelete={async (id) => {
                  onDelete?.(Number(id));
                }}
              />
            )}
          </div>
        );
      },
    },
  ];

  if (isComponent) {
    columns = [
      {
        id: 'select',
        header: '',
        cell: ({ row }) => {
          const book = row.original;
          const selectedIds = new Set(selectedData?.map((b) => b.bookId) || []);
          const isPreSelected = selectedIds.has(book.bookId);
          return (
            <Checkbox
              checked={row.getIsSelected()}
              disabled={isPreSelected}
              onCheckedChange={(value) => {
                row.toggleSelected(!!value);
              }}
              aria-label="Ô chọn"
            />
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
    ];
  }

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    getRowId: (row) => row.bookId.toString(),
    onRowSelectionChange: (updater) => {
      const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(newRowSelection);
      const selected = Object.keys(newRowSelection).map((rowId) =>
        [...data, ...selectData].find((item) => item.bookId.toString() === rowId)
      );
      setSelectData(selected.filter(Boolean) as Book[]);
    },
    state: {
      rowSelection,
    },
  });

  useEffect(() => {
    const defaultRowSelection: Record<string, boolean> = {};
    [...(selectedData || [])].forEach((item) => {
      defaultRowSelection[item.bookId.toString()] = true;
    });
    setRowSelection(defaultRowSelection);
  }, [selectedData]);

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
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="w-full h-4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell, cellIndex) => (
                    <TableCell
                      key={cell.id}
                      className={isComponent && cellIndex === 0 ? 'w-5' : undefined}
                    >
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
      <div className="my-4">
        <PaginationControls
          pageNumbers={pageNumbers}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      </div>
      {isComponent && (
        <div className="flex items-center justify-between flex-1">
          <div className="flex-1 pl-2 text-sm text-muted-foreground">
            {(selectedData?.length ?? 0) +
              selectData.filter(
                (item) => !new Set(selectedData?.map((b) => b.bookId)).has(item.bookId)
              ).length}
            / {total + (selectedData?.length ?? 0)} đã chọn.
          </div>
          <div className="space-x-2">
            <Button
              onClick={() => {
                const selectedIds = new Set(selectedData?.map((b) => b.bookId));
                const newSelected = selectData.filter((item) => !selectedIds.has(item.bookId));
                onConfirmSelect?.(newSelected);
              }}
              className="cursor-pointer"
            >
              Xác nhận
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectData([]);
                onClose?.();
              }}
              className="cursor-pointer"
            >
              Hủy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
