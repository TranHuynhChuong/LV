'use client';

import PagiantionControls from '@/components/utils/pagination-controls';
import api from '@/lib/axios-client';
import { Customer, mapCustomersFromDto } from '@/models/accounts';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import SwitchTab from '../switchtab';
import CustomerSearchbar from './customer-searchbar';
import CustomerTable from './customer-table';

export default function CustomerPanel() {
  const [data, setData] = useState<Customer[]>([]);
  const [pageNumbers, setPageNumbers] = useState<number[]>([1]);
  const [totalPage, setTotalPage] = useState<number>(1);
  const limit = 24;
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const email = searchParams.get('email') ?? '';

  async function getData(targetPage?: number) {
    const params = {
      page: targetPage,
      limit,
    };
    try {
      const res = await api.get('/users/customers', { params });
      const { data, paginationInfo } = res.data;
      setData(mapCustomersFromDto(data));
      setPageNumbers(paginationInfo.pageNumbers);
      setTotalPage(paginationInfo.totalPages);
    } catch {
      setData([]);
      setPageNumbers([1]);
    }
  }

  async function getByEmail(email: string) {
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
    } catch {
      setData([]);
      setPageNumbers([1]);
    }
  }

  useEffect(() => {
    if (!email.trim()) {
      getData(currentPage);
    } else {
      getByEmail(email);
    }
  }, [currentPage, email]);

  return (
    <div className="p-4">
      <div className="w-full p-4 space-y-4 bg-white rounded-sm shadow">
        <SwitchTab></SwitchTab>
        <CustomerSearchbar initialValue={email} />
        <CustomerTable data={data} />
        <div className="flex justify-start py-4">
          <PagiantionControls
            pageNumbers={pageNumbers}
            totalPages={totalPage}
            currentPage={currentPage}
            onPageChange={(page) => {
              if (page === currentPage) return;
              router.push(`/accounts/customers?page=${page}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
