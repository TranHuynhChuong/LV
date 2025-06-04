'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface PaginationControlsProps {
  paginate: number[];
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
  onFirstPage: () => void;
  onLastPage: () => void;
}

export default function PaginationControls({
  paginate,
  currentPage,
  totalPage,
  onPageChange,
  onFirstPage,
  onLastPage,
}: Readonly<PaginationControlsProps>) {
  if (!paginate || paginate.length === 0) return null;

  const pages = paginate.filter((page) => page !== 1 && page !== totalPage);

  return (
    <Pagination className="py-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onFirstPage();
            }}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
        {pages.length > 0 && pages[0] > 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {pages.map((page) => (
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

        {pages.length > 0 && pages[pages.length - 1] < totalPage - 1 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {pages.length > 0 && (
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onLastPage();
              }}
              isActive={currentPage === totalPage}
            >
              {totalPage}
            </PaginationLink>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
