import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import BookCard from "@/components/BookCard";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getBorrowedBooks } from "@/lib/actions/profile";
import { formatDate } from "@/lib/utils";
import { APP_NAME } from "@/lib/brand";

const Page = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [profile] = await db
    .select({
      fullName: users.fullName,
      email: users.email,
      universityId: users.universityId,
      status: users.status,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const borrowed = await getBorrowedBooks(session.user.id);
  const active = borrowed.filter((book) => book.borrowStatus === "BORROWED");
  const history = borrowed.filter((book) => book.borrowStatus === "RETURNED");

  return (
    <section className="flex flex-col gap-12">
      <div className="flex flex-col gap-6 rounded-2xl border border-light-400 bg-light-600 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="library-subtitle">Reader</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-dark-100">
            {profile?.fullName}
          </h1>
          <p className="mt-2 text-light-100">{profile?.email}</p>
          <p className="mt-1 text-sm text-light-100">
            University ID {profile?.universityId} · {profile?.status} ·{" "}
            {profile?.role === "ADMIN" ? "Admin" : "Student"}
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <Button
            variant="outline"
            className="border-light-400 bg-white text-dark-100"
          >
            Logout
          </Button>
        </form>
      </div>

      <section>
        <h2 className="font-serif text-4xl font-semibold text-dark-100">
          Currently borrowed
        </h2>
        {active.length === 0 ? (
          <p className="mt-4 text-light-100">
            Nothing checked out yet. Browse the {APP_NAME} catalog to borrow a
            book.
          </p>
        ) : (
          <ul className="book-list">
            {active.map((book) => (
              <BookCard key={book.borrowId} {...book} />
            ))}
          </ul>
        )}
      </section>

      {history.length > 0 ? (
        <section>
          <h2 className="font-serif text-4xl font-semibold text-dark-100">
            Returned
          </h2>
          <ul className="mt-8 space-y-4">
            {history.map((book) => (
              <li
                key={book.borrowId}
                className="flex items-center justify-between gap-4 rounded-xl border border-light-400 bg-light-600 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-dark-100">{book.title}</p>
                  <p className="text-sm text-light-100">
                    Returned {formatDate(book.returnDate)}
                  </p>
                </div>
                {book.borrowId ? (
                  <Button asChild variant="outline" className="border-light-400">
                    <a href={`/receipts/${book.borrowId}`}>Receipt</a>
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
};

export default Page;
