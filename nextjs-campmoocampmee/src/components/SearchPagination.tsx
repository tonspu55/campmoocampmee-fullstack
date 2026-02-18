import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
  createPageUrl: (pageNumber: number) => string;
}

export default function SearchPagination({
  currentPage,
  totalPages,
  createPageUrl,
}: SearchPaginationProps) {
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // สร้างรายการหน้าที่จะแสดงใน pagination
  const getPaginationNumbers = () => {
    const delta = 2; // จำนวนหน้าที่แสดงข้างๆ หน้าปัจจุบัน
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex justify-center">
      <Pagination>
        <PaginationContent>
          {hasPrevPage && (
            <PaginationItem>
              <PaginationPrevious href={createPageUrl(currentPage - 1)} />
            </PaginationItem>
          )}

          {getPaginationNumbers().map((page, index) => (
            <PaginationItem key={index}>
              {page === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href={createPageUrl(Number(page))}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {hasNextPage && (
            <PaginationItem>
              <PaginationNext href={createPageUrl(currentPage + 1)} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
