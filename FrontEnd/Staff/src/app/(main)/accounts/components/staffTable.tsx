'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/axiosClient';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export type Staff = {
  id: string;
  role: string;
  name: string;
  email: string;
  phone: string;
};

export default function StaffTable({ onDeleteSuccess }: { readonly onDeleteSuccess?: () => void }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Staff[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });

  const router = useRouter();

  const getData = () => {
    setIsLoading(true);
    setErrorMessage('');

    api
      .get('/users/staffs')
      .then((res) => {
        const data = res.data.data;

        type ApiStaff = {
          NV_id: string;
          NV_vaiTro: string;
          NV_hoTen: string;
          NV_email: string;
          NV_soDienThoai: string;
        };

        const result: ApiStaff[] = data;

        if (result.length > 0) {
          const mapped: Staff[] = result.map((staff: ApiStaff) => ({
            id: staff.NV_id,
            role: staff.NV_vaiTro,
            name: staff.NV_hoTen,
            email: staff.NV_email,
            phone: staff.NV_soDienThoai,
          }));

          setData(mapped);
          setErrorMessage('');
        } else {
          setData([]);
          setErrorMessage('Không có nhân viên nào trong hệ thống.');
        }
      })
      .catch((error) => {
        console.error('Lỗi khi gọi API:', error);
        const msg = error?.response?.data?.message ?? 'Đã xảy ra lỗi!';
        setErrorMessage(msg);
        setData([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const handleConfirmDelete = (id: string) => {
    if (!id) return;

    api
      .delete(`/users/staff/${id}`)
      .then((res) => {
        setData((prev) => prev.filter((item) => item.id !== id));
        onDeleteSuccess?.();
        setDeleteDialogOpen({
          open: false,
          id: null,
        });

        toast.success(res.data.message ?? 'Xóa thành công!');
      })
      .catch((error) => {
        const msg = error?.response?.data?.message ?? 'Đã xảy ra lỗi!';
        toast.error(msg);
        console.error('Xóa nhân viên thất bại:', error);
      });
  };

  const handleDoubleClick = (staff: Staff) => {
    router.push(`/accounts/staff/${staff.id}`);
  };

  const columns: ColumnDef<Staff>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Mã <ArrowUpDown className="w-4 h-4 ml-2" />
        </Button>
      ),
      enableHiding: false,
      cell: ({ row }) => <div className="pl-3">{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'role',
      header: 'Vai trò',
      enableHiding: false,
      cell: ({ row }) => <div>{row.getValue('role')}</div>,
    },
    {
      accessorKey: 'name',
      header: 'Họ tên',
      enableHiding: false,
      cell: ({ row }) => <div>{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableHiding: false,
      cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'phone',
      header: 'Số điện thoại',
      enableHiding: false,
      cell: ({ row }) => <div>{row.getValue('phone')}</div>,
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const staff = row.original;
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
                <Link href={`/accounts/${staff.id}`}>Cập nhật</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setDeleteDialogOpen({
                    open: true,
                    id: staff.id,
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
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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

  if (isLoading) {
    return null;
  }

  return (
    <>
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <Input
            placeholder="Tìm theo mã..."
            value={(table.getColumn('id')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('id')?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
          <Link href="accounts/new">
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
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onDoubleClick={() => {
                      handleDoubleClick(row.original);
                    }}
                  >
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
            <DialogTitle>Bạn có chắc muốn xóa nhân viên này?</DialogTitle>
          </DialogHeader>
          <div className="w-full h-10"></div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen({ open: false, id: null })}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (isDeleteDialogOpen.id) {
                  handleConfirmDelete(isDeleteDialogOpen.id);
                }
              }}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
