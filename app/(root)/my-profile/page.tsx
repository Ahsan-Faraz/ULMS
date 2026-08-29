import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getBorrowedBooks } from "@/lib/actions/profile";
import { formatDate, getDueLabel } from "@/lib/utils";
import { getUserHolds, overdueFine } from "@/lib/circulation";
import RenewButton from "@/components/RenewButton";
import CancelHoldButton from "@/components/CancelHoldButton";
import Link from "next/link";

const roleLabel = (role?: string | null) => {
  if (role === "ADMIN") return "Admin";
  if (role === "LIBRARIAN") return "Librarian";
  return "Student";
};

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
  const userHolds = await getUserHolds(session.user.id);
  const fine = active.reduce((sum, book) => sum + overdueFine(book.dueDate), 0);

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
            {roleLabel(profile?.role)}
          </p>
          {fine > 0 ? (
            <p className="mt-3 text-sm font-semibold text-red-700">
              Overdue balance ${fine}. Return those books to borrow again.
            </p>
          ) : null}
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
            Nothing checked out. Browse the catalog to borrow a book.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {active.map((book) => (
              <li
                key={book.borrowId}
                className="flex flex-col gap-3 rounded-xl border border-light-400 bg-light-600 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-dark-100">{book.title}</p>
                  <p className="text-sm text-light-100">
                    {getDueLabel(book.dueDate)} · Due {formatDate(book.dueDate)}
                    {book.renewed ? " · Renewed" : ""}
                    {overdueFine(book.dueDate) > 0
                      ? ` · Fine $${overdueFine(book.dueDate)}`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  {book.borrowId ? (
                    <RenewButton
                      borrowId={book.borrowId}
                      disabled={book.renewed || overdueFine(book.dueDate) > 0}
                    />
                  ) : null}
                  {book.borrowId ? (
                    <Button asChild variant="outline" className="border-light-400">
                      <Link href={`/receipts/${book.borrowId}`}>Receipt</Link>
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {userHolds.length > 0 ? (
        <section>
          <h2 className="font-serif text-4xl font-semibold text-dark-100">
            Holds
          </h2>
          <ul className="mt-6 space-y-4">
            {userHolds.map((hold) => (
              <li
                key={hold.id}
                className="flex flex-col gap-3 rounded-xl border border-light-400 bg-light-600 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-dark-100">{hold.title}</p>
                  <p className="text-sm text-light-100">
                    {hold.status === "READY"
                      ? "Ready to borrow"
                      : "Waiting for a copy"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {hold.status === "READY" ? (
                    <Button asChild className="bg-primary text-white">
                      <Link href={`/books/${hold.bookId}`}>Borrow now</Link>
                    </Button>
                  ) : null}
                  <CancelHoldButton holdId={hold.id} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
                    <Link href={`/receipts/${book.borrowId}`}>Receipt</Link>
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
