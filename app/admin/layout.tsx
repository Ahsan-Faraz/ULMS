import React, { ReactNode, Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import "@/styles/admin.css";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { getBranding } from "@/lib/settings";

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (!session?.user?.id) redirect("/sign-in");

  const [account] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const role = account?.role;
  if (role !== "ADMIN" && role !== "LIBRARIAN") redirect("/home");

  const brand = await getBranding();

  return (
    <main className="flex min-h-screen w-full flex-row overflow-x-hidden">
      <Sidebar
        session={session}
        role={role}
        brandName={brand.name}
        brandLogo={brand.logoUrl}
      />

      <div className="admin-container">
        <Suspense>
          <Header session={session} />
        </Suspense>
        {children}
      </div>
    </main>
  );
};
export default Layout;
