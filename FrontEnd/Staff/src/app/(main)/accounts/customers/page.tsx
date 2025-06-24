'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axiosClient';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PagiantionControls from '@/components/utils/PaginationControls';
import { useSearchParams, useRouter } from 'next/navigation';
import CustomerTable from './customerTable';
import SwitchTab from '../switchTab';
import { Customer, mapCustomersFromDto } from '@/models/accounts';

export default function Customers() {
  const [isLoading, setIsLoading] = useState(false);
  const [inputEmail, setInputEmail] = useState('');
  const [data, setData] = useState<Customer[]>([]);
  const [pageNumbers, setPageNumbers] = useState<number[]>([1]);
  const [totalPage, setTotalPage] = useState<number>(1);
  const limit = 24;

  const router = useRouter();

  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('p')) || 1;
  const search = searchParams.get('search') ?? '';

  async function fetchData(targetPage?: number) {
    setIsLoading(true);
    const params = {
      page: targetPage,
      limit,
    };

    try {
      const res = await api.get('/users/customers', { params });
      const { data, paginationInfo } = res.data;

      setData(mapCustomersFromDto([data]));
      setPageNumbers(paginationInfo.pageNumbers);
      setTotalPage(paginationInfo.totalPages);
    } catch (error) {
      console.error(error);
      setData([]);
      setPageNumbers([1]);
    } finally {
      setIsLoading(false);
    }
  }

  async function getByEmail(email: string) {
    setIsLoading(true);
    try {
      const res = await api.get(`/users/customer/${email}`);
      const result = res.data;

      if (!result) {
        setData([]);
        setPageNumbers([1]);
        return;
      }

      setData(mapCustomersFromDto([result]));
      setPageNumbers([1]);
    } catch (error) {
      console.error(error);
      setData([]);
      setPageNumbers([1]);
    } finally {
      setIsLoading(false);
    }
  }

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
            pageNumbers={pageNumbers}
            totalPages={totalPage}
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
