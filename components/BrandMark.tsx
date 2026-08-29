import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const BrandMark = ({
  href = "/home",
  variant = "public",
  showWordmark = true,
  name,
  logoUrl,
}: {
  href?: string;
  variant?: "public" | "admin" | "light";
  showWordmark?: boolean;
  name?: string;
  logoUrl?: string | null;
}) => {
  const isAdmin = variant === "admin";
  const wordmark = name || APP_NAME;
  const src = logoUrl || (isAdmin ? "/icons/admin/logo.svg" : "/icons/logo.svg");

  return (
    <Link href={href} className="flex items-center gap-2.5">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={`${wordmark} logo`}
          width={37}
          height={37}
          className="size-9 rounded-md object-contain"
        />
      ) : (
        <Image
          src={src}
          alt={`${wordmark} logo`}
          width={37}
          height={37}
          className="size-9 rounded-md object-contain"
        />
      )}
      {showWordmark ? (
        <span
          className={cn(
            "font-ibm-plex-sans text-xl font-semibold tracking-[0.14em]",
            variant === "light"
              ? "text-white"
              : isAdmin
                ? "text-primary-admin max-md:hidden"
                : "text-dark-100",
          )}
        >
          {wordmark}
        </span>
      ) : null}
    </Link>
  );
};

export default BrandMark;
