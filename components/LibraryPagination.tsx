import Link from "next/link";
import { cn } from "@/lib/utils";

const LibraryPagination = ({
  page,
  totalPages,
  q,
  genre,
  sort,
}: {
  page: number;
  totalPages: number;
  q: string;
  genre: string;
  sort: string;
}) => {
  if (totalPages <= 1) return null;

  const hrefFor = (nextPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (genre && genre !== "all") params.set("genre", genre);
    if (sort && sort !== "newest") params.set("sort", sort);
    params.set("page", String(nextPage));
    return `?${params.toString()}`;
  };

  return (
    <div className="mt-10 flex items-center justify-between gap-3">
      <p className="text-sm text-light-100">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Link
          href={hrefFor(Math.max(1, page - 1))}
          className={cn(
            "rounded-lg border border-light-400 bg-light-600 px-4 py-2 text-sm font-medium text-dark-100",
            page <= 1 && "pointer-events-none opacity-40",
          )}
        >
          Previous
        </Link>
        <Link
          href={hrefFor(Math.min(totalPages, page + 1))}
          className={cn(
            "rounded-lg border border-light-400 bg-light-600 px-4 py-2 text-sm font-medium text-dark-100",
            page >= totalPages && "pointer-events-none opacity-40",
          )}
        >
          Next
        </Link>
      </div>
    </div>
  );
};

export default LibraryPagination;
