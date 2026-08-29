import Link from "next/link";
import { signOut, auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import BrandMark from "@/components/BrandMark";
import HeaderNav from "@/components/HeaderNav";
import { getBranding } from "@/lib/settings";

const Header = async () => {
  const session = await auth();
  const brand = await getBranding();
  let isStaff = false;

  if (session?.user?.id) {
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    isStaff = user?.role === "ADMIN" || user?.role === "LIBRARIAN";
  }

  return (
    <header className="no-print my-10 flex flex-wrap items-center justify-between gap-5">
      <div className="flex items-center gap-8">
        <BrandMark href="/home" name={brand.name} logoUrl={brand.logoUrl} />
        <HeaderNav />
      </div>

      <ul className="flex flex-row items-center gap-3 sm:gap-4">
        {isStaff ? (
          <li>
            <Button asChild className="bg-primary text-white hover:bg-primary/90">
              <Link href="/admin">Staff</Link>
            </Button>
          </li>
        ) : null}
        <li>
          <form
            action={async () => {
              "use server";

              await signOut();
            }}
          >
            <Button
              variant="outline"
              className="border-light-400 bg-light-600 text-dark-100 hover:bg-light-400"
            >
              Logout
            </Button>
          </form>
        </li>
      </ul>
    </header>
  );
};

export default Header;
