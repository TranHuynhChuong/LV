'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axiosClient';

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type Customer = {
  name: string;
  email: string;
  createAt: string;
};

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <div>{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'name',
    header: 'Họ tên',
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'createAt',
    header: 'Ngày tạo',
    cell: ({ row }) => <div>{row.getValue('createAt')}</div>,
  },
];

export default function CustomerTable() {
  const [data, setData] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [pageIndex, setPageIndex] = useState(0);
  const [searchEmail, setSearchEmail] = useState('');
  const [inputEmail, setInputEmail] = useState('');

  const limit = 10;

  const getCustomers = async (page: number) => {
    setIsLoading(true);
    try {
      const res = await api.get('/users/customers', {
        params: { page: page + 1, limit },
      });

      const { customers, total } = res.data;

      type ApiCustomer = {
        KH_email: string;
        KH_hoTen: string;
        KH_tao: string;
      };

      const mapped: Customer[] = customers.map((item: ApiCustomer) => ({
        name: item.KH_hoTen,
        email: item.KH_email,
        createAt: item.KH_tao,
      }));

      setData(mapped);
      setTotalPages(Math.ceil(total / limit));
    } catch (err) {
      console.error('Lỗi khi lấy danh sách khách hàng:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getByEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await api.get('/users/customer-get-by-email', {
        params: { email },
      });

      const result = res.data;
      const mapped: Customer[] = result
        ? [
            {
              name: result.KH_hoTen,
              email: result.KH_email,
              createAt: result.KH_tao,
            },
          ]
        : [];

      setData(mapped);
      setTotalPages(1);
    } catch (err) {
      console.error('Lỗi khi tìm khách hàng:', err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!searchEmail) {
      getCustomers(pageIndex);
    }
  }, [pageIndex, searchEmail]);

  const handleApplySearch = () => {
    if (inputEmail.trim()) {
      setSearchEmail(inputEmail.trim());
      getByEmail(inputEmail.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchEmail('');
    setInputEmail('');
    setPageIndex(0);
    getCustomers(0);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      pagination: {
        pageIndex,
        pageSize: limit,
      },
    },
  });

  if (isLoading) {
    return <></>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 justify-end py-4">
        <Input
          placeholder="Tìm theo email..."
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button onClick={handleApplySearch}>Áp dụng</Button>
          <Button variant="outline" onClick={handleClearSearch}>
            Đặt lại
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="pl-5">
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
                  Không có kết quả.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground pl-3">
          Trang {pageIndex + 1} / {totalPages}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
            disabled={pageIndex === 0 || !!searchEmail}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((prev) => prev + 1)}
            disabled={pageIndex + 1 >= totalPages || !!searchEmail}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
