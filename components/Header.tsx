import Link from "next/link";
import Image from "next/image";
import { signOut, auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

const Header = async () => {
  const session = await auth();
  let isAdmin = false;

  if (session?.user?.id) {
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    isAdmin = user?.role === "ADMIN";
  }

  return (
    <header className="my-10 flex justify-between gap-5">
      <Link href="/">
        <Image src="/icons/logo.svg" alt="logo" width={40} height={40} />
      </Link>

      <ul className="flex flex-row items-center gap-4 sm:gap-8">
        {isAdmin ? (
          <li>
            <Button asChild className="bg-primary text-dark-100 hover:bg-primary/90">
              <Link href="/admin">Admin Panel</Link>
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
            <Button>Logout</Button>
          </form>
        </li>
      </ul>
    </header>
  );
};

export default Header;
