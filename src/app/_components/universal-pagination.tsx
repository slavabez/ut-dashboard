import { Fragment } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface IUniversalPaginationProps {
  currentPage: number;
  totalPages: number;
  baseRoute: string;
  skeleton?: boolean;
}

export const UniversalPagination = ({
  currentPage,
  totalPages,
  baseRoute,
  skeleton,
}: IUniversalPaginationProps) => {
  if (skeleton) {
    return (
      <Pagination className="m-2">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href={`${baseRoute}?page=1`}>1</PaginationLink>
          </PaginationItem>
          <PaginationEllipsis />
          <PaginationItem>
            <PaginationLink href={`${baseRoute}?page=10`}>X</PaginationLink>
          </PaginationItem>
        </PaginationContent>
        <PaginationNext href={`${baseRoute}?page=${currentPage + 1}`}>
          Следующая
        </PaginationNext>
      </Pagination>
    );
  }
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);

    // Always include the current page, previous and next pages if they exist
    pages.add(currentPage);
    if (currentPage - 1 > 1) pages.add(currentPage - 1);
    if (currentPage + 1 < totalPages) pages.add(currentPage + 1);

    return Array.from(pages).sort((a, b) => a - b);
  };

  const pages = getPages();

  return (
    <Pagination className="m-2 flex-wrap">
      {currentPage > 1 && (
        <PaginationPrevious
          href={`${baseRoute}?page=${currentPage - 1}`}
          lang="ru"
        />
      )}
      <PaginationContent>
        {pages.map((pageNum, i) => {
          // Handle ellipses for gaps
          if (i > 0 && pages[i] - pages[i - 1] > 1) {
            return (
              <Fragment key={`frag-${i}`}>
                <PaginationEllipsis key={`ellipsis-${i}`} />
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={currentPage === pageNum}
                    href={`${baseRoute}?page=${pageNum}`}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              </Fragment>
            );
          }
          return (
            <PaginationItem key={pageNum}>
              <PaginationLink
                isActive={currentPage === pageNum}
                href={`${baseRoute}?page=${pageNum}`}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          );
        })}
      </PaginationContent>
      {currentPage < totalPages && (
        <PaginationNext href={`${baseRoute}?page=${currentPage + 1}`}>
          Следующая
        </PaginationNext>
      )}
    </Pagination>
  );
};
