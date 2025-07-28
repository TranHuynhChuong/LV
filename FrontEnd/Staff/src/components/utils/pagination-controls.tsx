'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';

type Props = {
  pageNumbers: number[];
  currentPage: number;
  totalPages: number;
  onPageChange?: (targetPage: number) => void;
};

export default function PaginationControls({
  pageNumbers,
  currentPage,
  totalPages,
  onPageChange,
}: Readonly<Props>) {
  const pages = pageNumbers || [];

  const handlePageChange = (targetPage: number) => {
    if (onPageChange) {
      onPageChange(targetPage);
    }
  };

  return (
    <Pagination>
      <PaginationContent>
        {pages.length > 0 && pages[0] !== 1 && (
          <>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(1);
                }}
                isActive={currentPage === 1}
              >
                1
              </PaginationLink>
            </PaginationItem>

            {pages[0] > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page !== currentPage) handlePageChange(page);
              }}
              isActive={page === currentPage}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {pages.length > 0 && pages[pages.length - 1] < totalPages - 1 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {pages.length > 0 && pages[pages.length - 1] !== totalPages && (
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(totalPages);
              }}
              isActive={currentPage === totalPages}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
