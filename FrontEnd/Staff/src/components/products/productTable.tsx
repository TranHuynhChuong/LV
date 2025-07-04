'use client';

import { useEffect, useMemo, useState } from 'react';
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

import { Checkbox } from '@/components/ui/checkbox';
import PaginationControls from '@/components/utils/PaginationControls';
import { ProductOverView } from '@/models/products';

interface ProductTableProps {
  data: ProductOverView[];
  loading?: boolean;
  onDelete?: (code: number) => void;
  isComponent: boolean;
  total: number;
  pageNumbers: number[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onClose?: () => void;
  selectedData?: ProductOverView[];
  products?: ProductOverView[];
  onConfirmSelect?: (selecData: ProductOverView[]) => void;
}

export default function ProductTable({
  data,
  selectedData,
  products,
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
}: Readonly<ProductTableProps>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [selectData, setSelectData] = useState<ProductOverView[]>([]);

  const mergedData: ProductOverView[] = useMemo(() => {
    return [...(products?.filter((p) => !data.some((d) => d.id === p.id)) ?? []), ...data];
  }, [products, data]);

  let columns: ColumnDef<ProductOverView>[] = [
    {
      accessorKey: 'name',
      header: 'Sản phẩm',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className=" rounded-sm flex gap-4">
            <Avatar className="w-fit h-12 rounded-xs">
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
      accessorKey: 'salePrice',
      header: 'Giá bán',
      cell: ({ row }) => (
        <div>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(row.getValue('salePrice'))}
        </div>
      ),
    },
    {
      accessorKey: 'costPrice',
      header: !isComponent ? undefined : 'Giá nhập',
      enableHiding: false,
      cell: ({ row }) => {
        if (!isComponent) return undefined;

        const value = row.getValue<number>('costPrice');
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
        cell: ({ row }) => {
          const product = row.original;
          const selectedIds = new Set(selectedData?.map((p) => p.id) || []);
          const isPreSelected = selectedIds.has(product.id);

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
    data: mergedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    getRowId: (row) => row.id.toString(),
    onRowSelectionChange: (updater) => {
      const newRowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;

      setRowSelection(newRowSelection);

      const selected = Object.keys(newRowSelection).map((rowId) =>
        mergedData.find((item) => item.id.toString() === rowId)
      );

      setSelectData(selected.filter(Boolean) as ProductOverView[]);
    },
    state: {
      rowSelection,
    },
  });

  useEffect(() => {
    const defaultRowSelection: Record<string, boolean> = {};

    [...(selectedData || [])].forEach((item) => {
      defaultRowSelection[item.id.toString()] = true;
    });

    setRowSelection(defaultRowSelection);
  }, [selectedData]);

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
          pageNumbers={pageNumbers}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      </div>
      {isComponent && (
        <div className="flex flex-1 items-center justify-between">
          <div className="text-muted-foreground flex-1 text-sm pl-2">
            {(selectedData?.length ?? 0) +
              selectData.filter((item) => !new Set(selectedData?.map((p) => p.id)).has(item.id))
                .length}
            / {total + (selectedData?.length ?? 0)} đã chọn.
          </div>
          <div className="space-x-2">
            <Button
              onClick={() => {
                // Loại bỏ những sản phẩm đã được chọn sẵn (selectedData) khỏi selectData
                const selectedIds = new Set(selectedData?.map((p) => p.id));
                const newSelected = selectData.filter((item) => !selectedIds.has(item.id));
                onConfirmSelect?.(newSelected);
              }}
            >
              Xác nhận
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setSelectData([]);
                onClose?.();
              }}
            >
              Hủy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
