"use client";

import Image from "next/image";
import { adminSideBarLinks } from "@/constants";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { cn, getInitials } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";

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
  const links = adminSideBarLinks.filter((link) => {
    if (role === "ADMIN") return true;
    return !("adminOnly" in link && link.adminOnly);
  });

  return (
    <div className="admin-sidebar">
      <div>
        <div className="logo">
          <BrandMark
            href="/admin"
            variant="admin"
            name={brandName}
            logoUrl={brandLogo}
          />
        </div>

        <div className="mt-10 flex flex-col gap-5">
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

      <div className="space-y-3">
        <div className="user !my-0">
          <Avatar>
            <AvatarFallback className="bg-amber-100">
              {getInitials(session?.user?.name || "IN")}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-col max-md:hidden">
            <p className="font-semibold text-dark-200">{session?.user?.name}</p>
            <p className="truncate text-xs text-light-500">
              {role === "LIBRARIAN" ? "Librarian" : session?.user?.email}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-dark-200 hover:bg-light-300 max-md:px-2"
        >
          <Image src="/icons/logout.svg" alt="" width={16} height={16} />
          <span className="max-md:hidden">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
