import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  APPROVED: "bg-[#ECFDF3] text-[#027A48]",
  PENDING: "bg-[#FDF2FA] text-[#C11574]",
  REJECTED: "bg-[#FFF1F3] text-[#C01048]",
  ADMIN: "bg-[#ECFDF3] text-[#027A48]",
  USER: "bg-[#FDF2FA] text-[#C11574]",
  BORROWED: "bg-[#F9F5FF] text-[#6941C6]",
  RETURNED: "bg-[#F0F9FF] text-[#026AA2]",
  OVERDUE: "bg-[#FFF1F3] text-[#C01048]",
};

const StatusBadge = ({
  value,
  className,
}: {
  value: string;
  className?: string;
}) => {
  const label = value.charAt(0) + value.slice(1).toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize",
        styles[value] ?? "bg-light-400 text-dark-400",
        className,
      )}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
