'use client';

import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import EventBus from '@/lib/event-bus';
import { ShippingFee } from '@/models/shipping';
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
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import DeleteActionCell from '../utils/delete-action-cell';

type Props = {
  data: ShippingFee[];
};

export default function ShippingTable({ data }: Readonly<Props>) {
  const { authData } = useAuth();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [provinces, setProvinces] = useState<{ code: number; name: string }[]>([]);

  useEffect(() => {
    async function fetchProvinces() {
      const res = await api.get('/location/0');
      const data = res.data;
      const mapped = data.map((item: { T_id: number; T_ten: string }) => ({
        code: item.T_id,
        name: item.T_ten,
      }));
      setProvinces(mapped);
    }
    fetchProvinces();
  }, []);

  const columns: ColumnDef<ShippingFee>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      enableColumnFilter: true,
      cell: ({ row }) => <div className="pl-2">{row.getValue('id')}</div>,
      enableHiding: false,
    },
    {
      accessorKey: 'province',
      header: 'Khu vực',
      enableColumnFilter: true,
      cell: ({ row }) => <div className="pl-2">{row.getValue('province')}</div>,
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
      cell: ({ row }) => (
        <div>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(row.getValue('fee')) ?? '-'}
        </div>
      ),
    },
    {
      accessorKey: 'weight',
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
      cell: ({ row }) => <div>{row.getValue('weight') ?? '-'}</div>,
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
      cell: ({ row }) => (
        <div>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(row.getValue('surcharge')) ?? '-'}
        </div>
      ),
    },
    {
      accessorKey: 'surchargeUnit',
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
      cell: ({ row }) => <div>{row.getValue('surchargeUnit') ?? '-'}</div>,
    },
    {
      id: 'actions',
      enableHiding: false,
      header: 'Thao tác',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col items-start space-y-1">
            <Link className="cursor-pointer hover:underline" href={`/shipping/${item.id}`}>
              Cập nhật
            </Link>

            <DeleteActionCell
              resourceId={item.id?.toString()}
              onDelete={async (id) => {
                await api.delete(`/shipping/${id}?staffId=${authData.userId}`);
                EventBus.emit('shipping:refetch');
              }}
            />
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

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center pl-4 space-x-2">
          <span className="text-xl font-semibold">{data.length}</span>
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
          <Select
            onValueChange={(value) =>
              table.getColumn('province')?.setFilterValue(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tất cả tỉnh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {provinces.map((p) => (
                <SelectItem key={p.code} value={p.name}>
                  {p.name}
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
            {table.getRowModel().rows.length ? (
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
                  {'Không có kết quả.'}
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
    </>
  );
}
