'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { toast } from 'sonner';
import api from '@/lib/axiosClient';
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';

import { MoreHorizontal, Plus } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

import { Skeleton } from '@/components/ui/skeleton';

// Dữ liệu Category sử dụng tiếng Anh trong frontend
export type Category = {
  id: number;
  name: string;
  parent: string;
};

export default function Categories() {
  const { setBreadcrumbs } = useBreadcrumb();

  const [data, setData] = useState<Category[]>([]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState<{
    open: boolean;
    id: number | null;
  }>({
    open: false,
    id: null,
  });
  const [total, setTotal] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState('');

  const getData = () => {
    setLoading(true);
    api
      .get('/categories')
      .then((res) => {
        interface RawCategory {
          TL_id: number;
          TL_ten: string;
          TL_idTL: number;
        }

        const categoriesRaw: RawCategory[] = res.data;

        setTotal(categoriesRaw.length);
        // Map sang Category với parent là tên thể loại cha
        const categoriesMapped: Category[] = categoriesRaw.map((cat) => {
          const parentCategory = categoriesRaw.find((c) => c.TL_id === cat.TL_idTL);
          return {
            id: cat.TL_id,
            name: cat.TL_ten,
            parent: parentCategory ? parentCategory.TL_ten : '',
          };
        });

        setData(categoriesMapped);
      })
      .catch((error) => {
        setData([]);
        setErrorMessage('Đã xảy ra lỗi khi tải danh sách thể loại!');
        console.error('Lỗi tải dữ liệu thể loại:', error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getData();
  }, []);

  const handleConfirmDelete = (id: number) => {
    if (!id) return;
    setLoading(true);
    api
      .delete(`/categories/${id}`)
      .then(() => {
        setData((prev) => prev.filter((item) => item.id !== id));
        setDeleteDialogOpen({
          open: false,
          id: null,
        });
        toast.success('Xóa thành công!');
      })
      .catch((error) => {
        if (error.status === 400) {
          toast.error('Xóa thất bại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error('Xóa thất bại:', error);
      })
      .finally(() => setLoading(false));
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'id',
      header: 'Mã',
      cell: ({ row }) => <div className="pl-3">{row.getValue('id')}</div>,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Tên',
      enableHiding: false,
    },
    {
      accessorKey: 'parent',
      header: 'Thể loại cha',
      enableHiding: false,
    },
    {
      id: 'actions',
      enableHiding: false,
      header: 'Thao tác',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-8 h-8 p-0 cursor-pointer">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`/categories/${item.id}`}>Cập nhật</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setDeleteDialogOpen({
                    open: true,
                    id: item.id,
                  });
                }}
              >
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Danh mục' }]);
  }, [setBreadcrumbs]);

  return (
    <>
      <div className="w-full p-4 bg-white rounded-md shadow-sm h-fit ">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 pl-4">
            <span className="font-semibold text-xl">{total}</span>
            <span>Thể loại</span>
          </div>
          <Link href="/categories/new">
            <Button className="cursor-pointer">
              <Plus /> Thêm mới
            </Button>
          </Link>
        </div>
        <div className="border rounded-md">
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
                    {errorMessage || 'Không có kết quả.'}
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
        open={isDeleteDialogOpen.open}
        onOpenChange={(open) =>
          setDeleteDialogOpen((prev) => ({
            ...prev,
            open,
            id: open ? prev.id : null,
          }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa thể loại này? <br />
              Thông tin sẽ không thể khôi phục sau khi xóa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen({ open: false, id: null })}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              onClick={() => handleConfirmDelete(isDeleteDialogOpen.id!)}
              className="cursor-pointer"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
