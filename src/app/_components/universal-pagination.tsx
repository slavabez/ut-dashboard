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
}

export const UniversalPagination = ({
  currentPage,
  totalPages,
  baseRoute,
}: IUniversalPaginationProps) => {
  if (totalPages <= 1) return null;
  // If there are more than 5 pages, we will show the first 2 pages, the last 2 pages, and the current page
  if (totalPages > 5) {
    const pages = [
      1,
      2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      totalPages - 1,
      totalPages,
    ];
    return (
      <Pagination className="m-2">
        {currentPage > 1 && (
          <PaginationPrevious href={`${baseRoute}?page=${currentPage - 1}`}>
            Предыдущая
          </PaginationPrevious>
        )}
        <PaginationContent>
          {pages.map((pageNum, i) => {
            if (i === 0) {
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink href={`${baseRoute}?page=${pageNum}`}>
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            }
            if (i === 1 && currentPage > 3) {
              return <PaginationEllipsis key="ellipsis-1" />;
            }
            if (i === 5 && currentPage < totalPages - 2) {
              return <PaginationEllipsis key="ellipsis-2" />;
            }
            if (i === 6) {
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink href={`${baseRoute}?page=${pageNum}`}>
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            }
            return null;
          })}
        </PaginationContent>
        {currentPage < totalPages && (
          <PaginationNext href={`${baseRoute}?page=${currentPage + 1}`}>
            Следующая
          </PaginationNext>
        )}
      </Pagination>
    );
  }
  return (
    <Pagination className="m-2">
      {currentPage > 1 && (
        <PaginationPrevious href={`${baseRoute}?page=${currentPage - 1}`}>
          Предыдущая
        </PaginationPrevious>
      )}
      <PaginationContent>
        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1;
          return (
            <PaginationItem key={pageNum}>
              <PaginationLink
                href={`${baseRoute}?page=${pageNum}`}
                isActive={pageNum === currentPage}
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
