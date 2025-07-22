'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { toast } from 'sonner';
import api from '@/lib/axios';
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

import { Plus } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

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

import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import Loader from '@/components/utils/Loader';
import { Category } from '@/models/categories';

function getAllChildrenIds(parentId: number, categories: Category[]): number[] {
  const result: number[] = [];
  const stack: number[] = [parentId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    result.push(current);

    const children = categories.filter((cat) => cat.parentId === current);
    for (const child of children) {
      if (typeof child.id === 'number') {
        stack.push(child.id);
      }
    }
  }

  return result;
}

interface RawCategory {
  TL_id: number;
  TL_ten: string;
  TL_idTL: number;
}

function computeLevel(categoryId: number, categories: RawCategory[]) {
  let level = 1;
  let current = categories.find((c) => c.TL_id === categoryId);

  while (current && current.TL_idTL !== null) {
    const parent = categories.find((c) => c.TL_id === current?.TL_idTL);
    if (parent) {
      level++;
      current = parent;
    } else break;
  }
  return level;
}

export default function Categories() {
  const { setBreadcrumbs } = useBreadcrumb();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<Category[]>([]);
  const { authData } = useAuth();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [levelOptions, setLevelOptions] = useState<number[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<{
    open: boolean;
    id: number | null;
  }>({
    open: false,
    id: null,
  });
  const [total, setTotal] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState('');

  const getData = () => {
    setIsLoading(true);
    api
      .get('/categories')
      .then((res) => {
        const categoriesRaw: RawCategory[] = res.data;

        if (!categoriesRaw) return;

        setTotal(categoriesRaw.length);

        const categoriesMapped: Category[] = categoriesRaw.map((cat) => {
          const parentCategory = categoriesRaw.find((c) => c.TL_id === cat.TL_idTL);
          const childrenCount = categoriesRaw.filter((c) => c.TL_idTL === cat.TL_id).length;

          return {
            id: cat.TL_id,
            name: cat.TL_ten,
            parentId: cat.TL_idTL ?? null,
            parent: parentCategory ? parentCategory.TL_ten : '',
            childrenCount,
            level: computeLevel(cat.TL_id, categoriesRaw),
          };
        });

        const uniqueLevels = Array.from(
          new Set(
            categoriesMapped
              .map((c) => c.level)
              .filter((level): level is number => level !== undefined)
          )
        ).sort((a, b) => a - b);
        setLevelOptions(uniqueLevels);
        setData(categoriesMapped);
      })
      .catch((error) => {
        setData([]);
        setErrorMessage('Đã xảy ra lỗi khi tải danh sách thể loại!');
        console.error('Lỗi tải dữ liệu thể loại:', error);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    getData();
  }, []);

  const handleConfirmDelete = (id: number) => {
    setIsDeleteDialogOpen({ open: false, id: null });
    if (!id) return;
    setIsLoading(true);
    setIsSubmitting(true);
    api
      .delete(`/categories/${id}?staffId=${authData.userId}`)
      .then(() => {
        setIsDeleteDialogOpen({
          open: false,
          id: null,
        });
        toast.success('Xóa thành công!');
        getData();
      })
      .catch((error) => {
        if (error.status === 400) {
          toast.error('Xóa thất bại!');
        } else if (error.status === 409) {
          toast.error('Không thể xóa do ràng buộc dữ liệu!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error('Xóa thất bại:', error);
      })
      .finally(() => {
        setIsLoading(false);
        setIsSubmitting(false);
      });
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'id',
      header: 'Mã',
      cell: ({ row }) => <div className="pl-3">{row.getValue('id')}</div>,
      enableHiding: false,
      filterFn: (row, columnId, filterValue) => {
        const value = row.getValue<number>('id');
        if (Array.isArray(filterValue)) {
          return filterValue.includes(value);
        }
        return true;
      },
    },
    {
      accessorKey: 'name',
      header: 'Tên',
      enableHiding: false,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'level',
      header: 'Cấp',
      enableColumnFilter: true,
      filterFn: 'equals',
      cell: ({ row }) => <div className="text-center">{row.getValue('level')}</div>,
    },
    {
      accessorKey: 'childrenCount',
      header: 'SL thể loại con',
      cell: ({ row }) => <div className="text-center">{row.getValue('childrenCount')}</div>,
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
          <div className="flex flex-col space-y-1">
            <Link className="cursor-pointer hover:underline" href={`/categories/${item.id}`}>
              Cập nhật
            </Link>

            <button
              className="cursor-pointer hover:underline w-fit"
              onClick={() => {
                setIsDeleteDialogOpen({
                  open: true,
                  id: item.id ?? null,
                });
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
        pageSize: 12,
      },
    },
  });

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Danh mục' }]);
  }, [setBreadcrumbs]);

  return (
    <div className="p-4">
      {isSubmitting && <Loader />}
      <div className="w-full p-4 bg-white rounded-md shadow-sm h-fit min-w-fit">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center pl-4 space-x-2">
            <span className="text-xl font-semibold">{total}</span>
            <span>Thể loại</span>
          </div>
          <Link href="/categories/new">
            <Button className="cursor-pointer">
              <Plus /> Thêm mới
            </Button>
          </Link>
        </div>
        <div className="mb-4 flex gap-4">
          <Select
            onValueChange={(value) => {
              table.getColumn('level')?.setFilterValue(value === 'all' ? undefined : Number(value));
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả cấp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cấp</SelectItem>
              {levelOptions.map((level) => (
                <SelectItem key={level} value={String(level)}>
                  Cấp {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(value) => {
              if (value === 'all') {
                table.getColumn('id')?.setFilterValue(undefined);
                return;
              }

              const selectedId = Number(value);
              const allIds = getAllChildrenIds(selectedId, data);
              console.log(allIds);
              table.getColumn('id')?.setFilterValue(allIds);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tất cả thể loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thể loại</SelectItem>
              {data.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Tìm theo tên thể loại..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            className="w-full max-w-sm"
          />
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
          setIsDeleteDialogOpen((prev) => ({
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
              onClick={() => setIsDeleteDialogOpen({ open: false, id: null })}
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
    </div>
  );
}
