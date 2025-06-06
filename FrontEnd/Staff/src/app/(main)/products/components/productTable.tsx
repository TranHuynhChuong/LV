'use client';

import { useEffect, useState } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { ProductSimple } from '@/type/Product';
import { Checkbox } from '@/components/ui/checkbox';
import PaginationControls from '@/components/PaginationControls';

interface ProductTableProps {
  data: ProductSimple[];
  loading?: boolean;
  onDelete?: (code: number) => void;
  isComponent: boolean;
  total: number;
  pagination: number[];
  totalPage: number;
  page: number;
  onPageChange: (page: number) => void;
}

export default function ProductTable({
  data,
  loading = false,
  onDelete,
  isComponent = false,
  total,
  pagination,
  totalPage,
  page,
  onPageChange,
}: Readonly<ProductTableProps>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState({});

  const [selectedData, setSelectedData] = useState<ProductSimple[]>([]);

  let columns: ColumnDef<ProductSimple>[] = [
    {
      accessorKey: 'name',
      header: 'Sản phẩm',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className=" rounded-sm flex gap-4">
            <Avatar className="w-10 h-12 rounded-xs">
              <AvatarImage src={product.image} alt={product.name} />
              <AvatarFallback>#{product.id}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-sm leading-5 truncate max-w-36 lg:max-w-none">
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
      accessorKey: 'cost',
      header: undefined,
      enableHiding: false,
      cell: () => {
        return undefined;
      },
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

            {product.status === 2 && (
              <button
                className="cursor-pointer hover:underline w-fit"
                onClick={() => {
                  setDeleteDialogOpen(product.id ?? null);
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

  if (isComponent) {
    columns = [
      {
        id: 'select',
        header: '',
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Ô chọn"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
    ];
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString(), // <<< THÊM DÒNG NÀY
    onRowSelectionChange: (updater) => {
      const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;

      setRowSelection(newRowSelection);

      const selected = Object.keys(newRowSelection).map(
        (rowId) => table.getRowModel().rowsById[rowId]?.original
      );

      // Cập nhật selectedData
      setSelectedData(selected.filter(Boolean) as ProductSimple[]);
    },
    state: {
      rowSelection,
    },
  });

  useEffect(() => {
    const defaultRowSelection: Record<string, boolean> = {};

    selectedData.forEach((item) => {
      defaultRowSelection[item.id.toString()] = true;
    });

    setRowSelection(defaultRowSelection);
  }, [data]);

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
      {isComponent && (
        <div className="flex flex-1 items-center justify-between">
          <div className="text-muted-foreground flex-1 text-sm pl-2">
            {selectedData.length} / {total} đã chọn.
          </div>
          <div className="space-x-2">
            <Button onClick={() => console.log(selectedData)}>Xác nhận</Button>
            <Button variant="outline" onClick={() => setSelectedData([])}>
              Hủy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
