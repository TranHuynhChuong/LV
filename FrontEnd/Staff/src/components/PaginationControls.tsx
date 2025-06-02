'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

interface PaginationControlsProps {
  paginate: number[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onFirstPage: () => void;
  onLastPage: () => void;
}

export default function PaginationControls({
  paginate,
  currentPage,
  onPageChange,
  onFirstPage,
  onLastPage,
}: Readonly<PaginationControlsProps>) {
  if (!paginate || paginate.length === 0) return null;

  return (
    <Pagination>
      <PaginationContent>
        {/* Trang đầu */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onFirstPage();
            }}
          ></PaginationPrevious>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>

        {/* Các trang giữa */}
        {paginate.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page !== currentPage) onPageChange(page);
              }}
              isActive={page === currentPage}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>

        {/* Trang cuối */}
        <PaginationItem>
          <PaginationNext
            className="w-fit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onLastPage();
            }}
          ></PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
