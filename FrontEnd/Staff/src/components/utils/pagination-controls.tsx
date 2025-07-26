'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface PaginationControlsProps {
  pageNumbers: number[];
  currentPage: number;
  totalPages: number;
  onPageChange: (targetPage: number) => void;
}

export default function PaginationControls({
  pageNumbers,
  currentPage,
  totalPages,
  onPageChange,
}: Readonly<PaginationControlsProps>) {
  const pages = pageNumbers || [];

  return (
    <Pagination>
      <PaginationContent>
        {/* Hiện trang 1 nếu thiếu */}
        {pages.length > 0 && pages[0] !== 1 && (
          <>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(1);
                }}
                isActive={currentPage === 1}
              >
                1
              </PaginationLink>
            </PaginationItem>

            {/* Ellipsis nếu pages[0] > 2 (tức bỏ qua trang 2) */}
            {pages[0] > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

        {/* Render các trang hiện tại */}
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

        {/* Ellipsis nếu còn khoảng cách phía sau */}
        {pages.length > 0 && pages[pages.length - 1] < totalPages - 1 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Hiện trang totalPage nếu bị thiếu */}
        {pages.length > 0 && pages[pages.length - 1] !== totalPages && (
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(totalPages);
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
