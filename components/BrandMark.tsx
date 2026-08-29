import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const BrandMark = ({
  href = "/",
  variant = "public",
  showWordmark = true,
}: {
  href?: string;
  variant?: "public" | "admin";
  showWordmark?: boolean;
}) => {
  const isAdmin = variant === "admin";

  return (
    <Link href={href} className="flex items-center gap-2.5">
      <Image
        src={isAdmin ? "/icons/admin/logo.svg" : "/icons/logo.svg"}
        alt={`${APP_NAME} logo`}
        width={37}
        height={37}
        className="size-9"
      />
      {showWordmark ? (
        <span
          className={cn(
            "font-serif text-2xl font-semibold tracking-tight",
            isAdmin ? "text-primary-admin max-md:hidden" : "text-dark-100",
          )}
        >
          {APP_NAME}
        </span>
      ) : null}
    </Link>
  );
};

export default BrandMark;
