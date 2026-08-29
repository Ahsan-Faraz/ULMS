"use client";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import AdminSearch from "@/components/admin/AdminSearch";
import { Button } from "@/components/ui/button";

const searchPlaceholder = (path: string) => {
  if (path.startsWith("/admin/users")) return "Search users by name or email";
  if (path.startsWith("/admin/account-requests")) return "Search account requests";
  if (path.startsWith("/admin/book-requests")) return "Search borrow records";
  if (path.startsWith("/admin/books")) return "Search books by title or author";
  return "Search books, users, and requests";
};

const Header = ({ session }: { session: Session }) => {
  const pathname = usePathname();

  return (
    <header className="admin-header">
      <div>
        <h2 className="text-2xl font-semibold text-dark-400">
          Welcome, {session?.user?.name}
        </h2>
        <p className="text-base text-slate-500">
          Monitor users, books, and borrow activity from one place.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 lg:max-w-md">
        <Suspense>
          <AdminSearch placeholder={searchPlaceholder(pathname)} />
        </Suspense>
        <Button
          type="button"
          variant="outline"
          className="self-end border-light-400 bg-white text-dark-400"
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
        >
          Logout
        </Button>
      </div>
    </header>
  );
};
export default Header;
