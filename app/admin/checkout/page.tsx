import { db } from "@/database/drizzle";
import { books, users } from "@/database/schema";
import { and, asc, eq, gt } from "drizzle-orm";
import CheckoutForm from "@/components/admin/CheckoutForm";

const Page = async () => {
  const patrons = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
    })
    .from(users)
    .where(and(eq(users.status, "APPROVED"), eq(users.role, "USER")))
    .orderBy(asc(users.fullName));

  const titles = await db
    .select({
      id: books.id,
      title: books.title,
      availableCopies: books.availableCopies,
    })
    .from(books)
    .where(gt(books.availableCopies, 0))
    .orderBy(asc(books.title));

  return (
    <section className="admin-panel max-w-2xl">
      <h2 className="text-xl font-semibold text-dark-400">Circulation desk</h2>
      <p className="mt-1 text-sm text-light-500">
        Check a book out for a student. Due date follows the library loan length.
      </p>
      <div className="mt-8">
        <CheckoutForm patrons={patrons} titles={titles} />
      </div>
    </section>
  );
};

export default Page;
