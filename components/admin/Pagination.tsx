import Link from "next/link";
import { cn } from "@/lib/utils";

const Pagination = ({
  page,
  totalPages,
  query,
  filter,
}: {
  page: number;
  totalPages: number;
  query?: string;
  filter?: string;
}) => {
  if (totalPages <= 1) return null;

  const hrefFor = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (filter && filter !== "all") params.set("filter", filter);
    params.set("page", String(nextPage));
    return `?${params.toString()}`;
  };

  return (
    <div className="mt-6 flex flex-col gap-3 xs:flex-row xs:items-center xs:justify-between">
      <p className="text-sm text-light-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Link
          href={hrefFor(Math.max(1, page - 1))}
          className={cn(
            "rounded-lg border border-light-400 bg-white px-4 py-2 text-sm font-medium text-dark-400",
            page <= 1 && "pointer-events-none opacity-40",
          )}
        >
          Previous
        </Link>
        <Link
          href={hrefFor(Math.min(totalPages, page + 1))}
          className={cn(
            "rounded-lg border border-light-400 bg-white px-4 py-2 text-sm font-medium text-dark-400",
            page >= totalPages && "pointer-events-none opacity-40",
          )}
        >
          Next
        </Link>
      </div>
    </div>
  );
};

export default Pagination;
