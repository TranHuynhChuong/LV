'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axiosClient';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PagiantionControls from '@/components/PaginationControls';
import { useSearchParams, useRouter } from 'next/navigation';
import { ApiCustomer, Customer } from '@/type/Account';
import CustomerTable from './customerTable';
import SwitchTab from '../switchTab';

export default function Customers() {
  const [isLoading, setIsLoading] = useState(false);
  const [inputEmail, setInputEmail] = useState('');
  const [data, setData] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<number[]>([1]);
  const [totalPage, setTotalPage] = useState<number>(1);
  const limit = 24;

  const router = useRouter();

  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('p')) || 1;
  const search = searchParams.get('search') ?? '';

  const fetchData = async (targetPage?: number) => {
    setIsLoading(true);
    const params = {
      page: targetPage,
      limit,
    };

    api
      .get('/users/customers', { params })
      .then((res) => {
        const { data, metadata } = res.data;

        const mapped: Customer[] = data.map((item: ApiCustomer) => ({
          name: item.KH_hoTen,
          email: item.KH_email,
          createAt: new Date(item.KH_ngayTao).toLocaleString('vi-VN'),
          status: item.KH_trangThai,
        }));

        setData(mapped);
        setPagination(metadata.pagination);
        setTotalPage(metadata.totalPage);
      })
      .catch(() => {
        setData([]);
        setPagination([1]);
      })
      .finally(() => setIsLoading(false));
  };

  const getByEmail = async (email: string) => {
    setIsLoading(true);
    api
      .get(`/users/customer/${email}`)
      .then((res) => {
        const result = res.data;
        if (!result) {
          setData([]);
          setPagination([1]);
          return;
        }
        const mapped: Customer[] = [
          {
            name: result.KH_hoTen,
            email: result.KH_email,
            createAt: new Date(result.KH_ngayTao).toLocaleString('vi-VN'),
            status: result.KH_trangThai,
          },
        ];
        setData(mapped);
        setPagination([1]);
      })
      .catch(() => {
        setData([]);
        setPagination([1]);
      })
      .finally(() => setIsLoading(false));
  };

  const handleApplySearch = () => {
    if (inputEmail.trim()) {
      router.push(`/accounts/customers?search=${inputEmail.trim()}`);
    }
  };

  const handleClearSearch = () => {
    router.push(`/accounts/customers?p=1`);
  };

  useEffect(() => {
    setInputEmail(search);
  }, [search]);

  useEffect(() => {
    if (!search.trim()) {
      fetchData(currentPage);
    } else {
      getByEmail(search);
    }
  }, [currentPage, search]);

  return (
    <div className="p-4">
      <div className="w-full space-y-4 bg-white p-4 rounded-sm shadow">
        <SwitchTab></SwitchTab>
        <div className="flex items-center justify-end gap-2 py-4">
          <div className="flex flex-1 space-x-4">
            <Input
              placeholder="Tìm theo email..."
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleApplySearch}>
                Áp dụng
              </Button>
              <Button variant="outline" onClick={handleClearSearch}>
                Đặt lại
              </Button>
            </div>
          </div>
        </div>

        <CustomerTable data={data} isLoading={isLoading} />

        <div className="flex justify-start py-4">
          <PagiantionControls
            pagination={pagination}
            totalPage={totalPage}
            currentPage={currentPage}
            onPageChange={(page) => {
              if (page === currentPage) return;
              router.push(`/accounts/customers?p=${page}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
