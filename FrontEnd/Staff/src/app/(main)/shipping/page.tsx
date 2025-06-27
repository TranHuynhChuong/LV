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
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Loader from '@/components/utils/Loader';
import { useAuth } from '@/contexts/AuthContext';
import { ShippingFee, ShippingFeeDto } from '@/models/shipping';

export type Shipping = {
  id: number;
  fee: number;
  level: string;
  surcharge?: number;
  unit?: string;
  location: string;
  locationId: number;
};

export default function Shipments() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const [data, setData] = useState<ShippingFee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<{
    open: boolean;
    id: number | null;
  }>({
    open: false,
    id: null,
  });
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [provinces, setProvinces] = useState<{ T_id: number; T_ten: string }[]>([]);
  const getData = () => {
    setLoading(true);
    Promise.all([api.get('/shipping'), fetch('/addresses/0.json').then((res) => res.json())])
      .then(([shippingRes, locationRes]) => {
        setProvinces(locationRes);

        const shippingRaw: ShippingFeeDto[] = shippingRes.data;
        setTotal(shippingRaw.length);
        const mapped: ShippingFee[] = shippingRaw.map((item) => {
          const province = locationRes.find(
            (p: { T_id: number; T_ten: string }) => p.T_id === item.T_id
          ); // Dùng trực tiếp locationRes
          const locationName =
            item.T_id === 0 ? 'Khu vực còn lại' : province?.T_ten ?? 'Không xác định';

          return {
            id: item.PVC_id,
            fee: item.PVC_phi,
            level: item.PVC_ntl,
            surcharge: item.PVC_phuPhi,
            unit: item.PVC_dvpp,
            location: locationName,
            locationId: item.T_id,
          };
        });

        setData(mapped);
      })
      .catch((error) => {
        setData([]);
        setErrorMessage('Đã xảy ra lỗi!');
        console.error('Lỗi tải dữ liệu phí vận chuyển:', error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getData();
  }, []);

  const handleConfirmDelete = (id: number) => {
    if (!id) return;
    setLoading(true);
    setIsSubmitting(true);
    api
      .delete(`/shipping/${id}?staffId=${authData.userId}`)
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
      .finally(() => {
        setLoading(false);
        setIsSubmitting(true);
      });
  };

  const columns: ColumnDef<ShippingFee>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      enableColumnFilter: true,
      cell: ({ row }) => <div className="pl-2">{row.getValue('id')}</div>,
      enableHiding: false,
    },
    {
      accessorKey: 'location',
      header: 'Khu vực',
      enableColumnFilter: true,
      cell: ({ row }) => <div className="pl-2">{row.getValue('location')}</div>,
      enableHiding: false,
    },
    {
      accessorKey: 'fee',
      header: () => (
        <HoverCard>
          <HoverCardTrigger>
            <span className="cursor-help">Phí (VND)</span>
          </HoverCardTrigger>
          <HoverCardContent className="w-80" side="top">
            <div className="flex justify-between space-x-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Phí vận chuyển cơ bản (VND)</h4>
                <p className="text-sm">
                  Số tiền cố định áp dụng cho các đơn hàng có trọng lượng bằng hoặc dưới ngưỡng
                  trọng lượng cơ bản (Trọng lượng).
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ),
      enableHiding: false,
      cell: ({ row }) => <div>{row.getValue('fee')}</div>,
    },
    {
      accessorKey: 'level',
      header: () => (
        <HoverCard>
          <HoverCardTrigger asChild>
            <span className="cursor-help">Trọng lượng (Kg)</span>
          </HoverCardTrigger>
          <HoverCardContent className="w-80" side="top">
            <div className="flex justify-between space-x-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Ngưỡng trọng lượng cơ bản (Kg)</h4>
                <p className="text-sm">
                  Mức trọng lượng tối đa mà chỉ cần trả phí vận chuyển cơ bản mà không phát sinh
                  thêm phụ phí.
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'surcharge',
      header: () => (
        <HoverCard>
          <HoverCardTrigger asChild>
            <span className="cursor-help">Phụ phí (VND)</span>
          </HoverCardTrigger>
          <HoverCardContent className="w-80" side="top">
            <div className="flex justify-between space-x-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Phụ phí theo đơn vị (VND)</h4>
                <p className="text-sm">
                  Là số tiền bị tính thêm cho mỗi đơn vị phụ phí (Đơn vị) vượt mức trọng lượng.
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ),
      enableHiding: false,
      cell: ({ row }) => <div>{row.getValue('surcharge') ?? '-'}</div>,
    },
    {
      accessorKey: 'unit',
      header: () => (
        <HoverCard>
          <HoverCardTrigger asChild>
            <span className="cursor-help">Đơn vị (Gram)</span>
          </HoverCardTrigger>
          <HoverCardContent className="w-80" side="top">
            <div className="flex justify-between space-x-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Đơn vị phụ phí (Gram)</h4>
                <p className="text-sm">
                  Khoảng trọng lượng vượt quá mà mỗi đơn vị như vậy sẽ bị tính thêm một khoản phụ
                  phí.
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ),
      enableHiding: false,
      cell: ({ row }) => <div>{row.getValue('unit') ?? '-'}</div>,
    },
    {
      id: 'actions',
      enableHiding: false,
      header: 'Thao tác',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col space-y-1">
            <Link className="cursor-pointer hover:underline" href={`/shipping/${item.id}`}>
              Cập nhật
            </Link>

            <button
              className="cursor-pointer hover:underline w-fit"
              type="button"
              onClick={() => {
                setDeleteDialogOpen({
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
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Phí vận chuyển' }]);
  }, [setBreadcrumbs]);

  return (
    <div className="p-4 min-w-fit">
      {isSubmitting && <Loader />}
      <div className="w-full p-4 bg-white rounded-md shadow-sm h-fit">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center pl-4 space-x-2">
            <span className="text-xl font-semibold">{total}</span>
            <span>Phí vận chuyển</span>
          </div>
          <Link href="shipping/new">
            <Button className="cursor-pointer">
              <Plus /> Thêm mới
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div>
            <label className="block mb-1 text-sm">Lọc theo tỉnh</label>
            <Select
              onValueChange={(value) =>
                table.getColumn('location')?.setFilterValue(value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tất cả tỉnh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {provinces.map((p) => (
                  <SelectItem key={p.T_id} value={p.T_ten}>
                    {p.T_ten}
                  </SelectItem>
                ))}
                <SelectItem value="Khu vực còn lại">Khu vực còn lại</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              {loading ? (
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
        open={deleteDialogOpen.open}
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
              Bạn có chắc muốn xóa thông tin này? <br />
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
              onClick={() => handleConfirmDelete(deleteDialogOpen.id!)}
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
