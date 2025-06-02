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
import { Skeleton } from '@/components/ui/skeleton';
import PagiantionControls from '@/components/PaginationControls';

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
  const [paginate, setPaginate] = useState<number[]>([1]); // mảng các số trang do API trả về
  const [currentPage, setCurrentPage] = useState(1);
  const [cursorId, setCursorId] = useState<string | undefined>(undefined);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [searchEmail, setSearchEmail] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const limit = 24;

  // Gọi API phân trang chung theo mode + cursorId + currentPage + targetPage
  const fetchData = (mode: 'head' | 'tail' | 'cursor', targetPage?: number, cursor?: string) => {
    setIsLoading(true);
    setErrorMessage('');
    let params;
    if (targetPage && cursor) {
      params = {
        mode,
        cursorId: cursor,
        currentPage,
        targetPage,
        limit,
      };
    } else {
      params = {
        mode,
        limit,
      };
    }

    return api
      .get('/users/customers', {
        params: params,
      })
      .then((res) => {
        const { data, paginate, currentPage, cursorId, totalPage } = res.data;

        if (!data.length) {
          setData([]);
          setPaginate([1]);
          setErrorMessage('Không có kết quả.');
          return;
        }

        type ApiCustomer = {
          KH_email: string;
          KH_hoTen: string;
          KH_tao: string;
        };

        const mapped: Customer[] = data.map((item: ApiCustomer) => ({
          name: item.KH_hoTen,
          email: item.KH_email,
          createAt: new Date(item.KH_tao).toLocaleString('vi-VN'),
        }));

        setData(mapped);
        setPaginate(paginate);
        setCurrentPage(currentPage);
        setCursorId(cursorId);
        setTotalPage(totalPage);
      })
      .catch(() => {
        setErrorMessage('Lỗi khi lấy danh sách khách hàng.');
        setData([]);
        setPaginate([1]);
      })
      .finally(() => setIsLoading(false));
  };

  // Tìm theo email
  const getByEmail = (email: string) => {
    setIsLoading(true);
    setErrorMessage('');
    api
      .get(`/users/customer/${email}`)
      .then((res) => {
        const result = res.data;
        if (!result) {
          setErrorMessage('Không tìm thấy khách hàng.');
          setData([]);
          setPaginate([1]);
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
        setPaginate([1]);
        setCurrentPage(1);
        setCursorId(undefined);
      })
      .catch((error) => {
        if (error.status === 404) {
          setErrorMessage('Không tìm thấy khách hàng.');
        } else {
          setErrorMessage('Lỗi khi tìm khách hàng.');
        }
        setData([]);
        setPaginate([1]);
      })
      .finally(() => setIsLoading(false));
  };

  // Khởi tạo dữ liệu khi load trang hoặc khi currentPage thay đổi & searchEmail rỗng
  useEffect(() => {
    if (!searchEmail) {
      // luôn bắt đầu bằng mode 'head' nếu chưa có cursorId, hoặc mode 'cursor' nếu có
      if (!cursorId) {
        fetchData('head');
      } else {
        fetchData('cursor', currentPage, cursorId);
      }
    }
  }, [currentPage, searchEmail]);

  // Áp dụng tìm kiếm theo email
  const handleApplySearch = () => {
    if (inputEmail.trim()) {
      setSearchEmail(inputEmail.trim());
      getByEmail(inputEmail.trim());
    }
  };

  // Xóa tìm kiếm, reset về trang đầu
  const handleClearSearch = () => {
    setSearchEmail('');
    setInputEmail('');
    setCurrentPage(1);
    setCursorId(undefined);
    setErrorMessage('');
  };

  // React-table setup
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Xử lý click chuyển trang pagination shadcn
  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    if (searchEmail) return;
    fetchData('cursor', page, cursorId);
  };
  const handleFirstPage = () => {
    fetchData('head');
  };
  const handleLastPage = () => {
    fetchData('head');
  };

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
                <TableRow key={row.id} className="cursor-pointer">
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
      <div className="flex justify-start py-4">
        <PagiantionControls
          paginate={paginate}
          totalPage={totalPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onFirstPage={handleFirstPage}
          onLastPage={handleLastPage}
        ></PagiantionControls>
      </div>
    </div>
  );
}
