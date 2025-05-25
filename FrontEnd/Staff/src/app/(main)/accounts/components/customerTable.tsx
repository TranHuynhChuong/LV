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
  const [errorMessage, setErrorMessage] = useState('');

  const limit = 24;

  const getCustomers = (page: number) => {
    setIsLoading(true);
    setErrorMessage('');
    api
      .get('/users/customers', { params: { page, limit } })
      .then((res) => {
        const { results, total } = res.data.data;

        if (!results.length) {
          setData([]);
          setTotalPages(1);
          return;
        }

        type ApiCustomer = {
          KH_email: string;
          KH_hoTen: string;
          KH_tao: string;
        };

        const mapped: Customer[] = results.map((item: ApiCustomer) => ({
          name: item.KH_hoTen,
          email: item.KH_email,
          createAt: new Date(item.KH_tao).toLocaleString('vi-VN'),
        }));

        setData(mapped);
        setTotalPages(Math.ceil(total / limit));
      })
      .catch((err) => {
        const msg = err?.response?.data?.message ?? 'Lỗi khi lấy danh sách khách hàng.';
        setErrorMessage(msg);
        setData([]);
        setTotalPages(1);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getByEmail = (email: string) => {
    setIsLoading(true);
    setErrorMessage('');
    api
      .get(`/users/customer/${email}`)
      .then((res) => {
        const result = res.data.data;

        if (!result) {
          setErrorMessage('Không tìm thấy khách hàng.');
          setData([]);
          setTotalPages(1);
          return;
        }
        const mapped: Customer[] = [
          {
            name: result.KH_hoTen,
            email: result.KH_email,
            createAt: new Date(result.KH_tao).toLocaleString('vi-VN'),
          },
        ];
        setData(mapped);
        setTotalPages(1);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Lỗi khi tìm khách hàng.';
        setErrorMessage(msg);
        setData([]);
        setTotalPages(1);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
    setErrorMessage('');
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
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-end gap-2 py-4">
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

      <div className="border rounded-md">
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
            {data.length ? (
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
