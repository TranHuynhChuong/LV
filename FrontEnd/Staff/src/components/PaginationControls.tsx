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

  const showFirst = paginate[0] > 1;
  const showLast = paginate[paginate.length - 1] < totalPage;

  return (
    <Pagination className="py-2">
      <PaginationContent>
        {/* Trang đầu và dấu ... nếu cần */}
        {showFirst && (
          <>
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
            {paginate[0] > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

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

        {/* Dấu ... và trang cuối nếu cần */}
        {showLast && (
          <>
            {paginate[paginate.length - 1] < totalPage - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
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
          </>
        )}
      </PaginationContent>
    </Pagination>
  );
}
