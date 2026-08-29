"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { adminSideBarLinks } from "@/constants";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { cn, getInitials } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { ChevronUp, LogOut } from "lucide-react";

const Sidebar = ({
  session,
  role,
  brandName,
  brandLogo,
}: {
  session: Session;
  role: "ADMIN" | "LIBRARIAN" | "USER";
  brandName?: string;
  brandLogo?: string | null;
}) => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const links = adminSideBarLinks.filter((link) => {
    if (role === "ADMIN") return true;
    return !("adminOnly" in link && link.adminOnly);
  });

  useEffect(() => {
    if (!menuOpen) return;

    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="admin-sidebar">
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="logo">
          <BrandMark
            href="/admin"
            variant="admin"
            name={brandName}
            logoUrl={brandLogo}
          />
        </div>

        <div className="mt-6 flex flex-col gap-1">
          {links.map((link) => {
            const isSelected =
              (link.route !== "/admin" &&
                pathname.includes(link.route) &&
                link.route.length > 1) ||
              pathname === link.route;

            return (
              <Link href={link.route} key={link.route}>
                <div
                  className={cn(
                    "link",
                    isSelected && "bg-primary-admin shadow-sm",
                  )}
                >
                  <div className="relative size-5">
                    <Image
                      src={link.img}
                      alt="icon"
                      fill
                      className={`${isSelected ? "brightness-0 invert" : ""}  object-contain`}
                    />
                  </div>

                  <p className={cn(isSelected ? "text-white" : "text-dark")}>
                    {link.text}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div ref={menuRef} className="relative shrink-0">
        {menuOpen ? (
          <div className="absolute inset-x-0 bottom-full mb-2 rounded-2xl border border-light-400 bg-white p-1 shadow-[0_12px_32px_rgba(28,25,22,0.12)]">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-dark-200 hover:bg-light-300"
            >
              <LogOut className="size-4 shrink-0" />
              <span className="max-md:hidden">Logout</span>
            </button>
          </div>
        ) : null}

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((open) => !open)}
          className="user !my-0 w-full items-center text-left hover:bg-light-300"
        >
          <Avatar>
            <AvatarFallback className="bg-amber-100">
              {getInitials(session?.user?.name || "IN")}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 max-md:hidden">
            <p className="truncate font-semibold text-dark-200">
              {session?.user?.name}
            </p>
            <p className="truncate text-xs text-light-500">
              {role === "LIBRARIAN" ? "Librarian" : session?.user?.email}
            </p>
          </div>

          <ChevronUp
            className={cn(
              "size-4 shrink-0 text-light-500 transition-transform max-md:hidden",
              menuOpen ? "rotate-0" : "rotate-180",
            )}
          />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
