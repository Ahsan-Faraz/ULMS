import { cn } from "@/lib/utils";

const StatCard = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) => {
  return (
    <article className="stat min-w-[160px]">
      <div className="stat-info">
        <p className="stat-label">{label}</p>
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className="stat-count">{value}</p>
        {hint ? (
          <p className={cn("text-xs font-medium text-green-800")}>{hint}</p>
        ) : null}
      </div>
    </article>
  );
};

export default StatCard;
