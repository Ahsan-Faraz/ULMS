"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/library", label: "Library" },
  { href: "/my-profile", label: "My Profile" },
];

const HeaderNav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-3 sm:gap-6">
      {links.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm font-medium transition-colors",
              isActive ? "text-primary" : "text-dark-200 hover:text-dark-100",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default HeaderNav;
