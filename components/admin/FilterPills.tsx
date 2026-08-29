import { cn } from "@/lib/utils";
import Link from "next/link";

const FilterPills = ({
  value,
  query,
  options,
}: {
  value: string;
  query?: string;
  options: { label: string; value: string }[];
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const params = new URLSearchParams();
        if (query) params.set("query", query);
        if (option.value !== "all") params.set("filter", option.value);
        const href = params.toString() ? `?${params.toString()}` : "?";
        const active = value === option.value;

        return (
          <Link
            key={option.value}
            href={href}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold",
              active
                ? "bg-primary-admin text-white"
                : "bg-light-300 text-dark-400 hover:bg-light-400",
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
};

export default FilterPills;
