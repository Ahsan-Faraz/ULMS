import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { auth } from "@/auth";
import { desc } from "drizzle-orm";
import Link from "next/link";

const Home = async () => {
  const session = await auth();

  const latestBooks = (await db
    .select()
    .from(books)
    .limit(10)
    .orderBy(desc(books.createdAt))) as Book[];

  if (latestBooks.length === 0) {
    return (
      <section className="rounded-2xl border border-light-400 bg-light-600 p-10 text-center">
        <p className="library-subtitle">Catalog</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-dark-100">
          No titles yet
        </h1>
        <p className="mt-3 text-light-100">
          An admin can add the first book from the staff panel.
        </p>
      </section>
    );
  }

  return (
    <>
      <BookOverview {...latestBooks[0]} userId={session?.user?.id as string} />

      <BookList
        title="Latest Books"
        books={latestBooks.slice(1)}
        containerClassName="mt-28"
      />

      <div className="mt-12">
        <Link href="/library" className="text-sm font-semibold text-primary">
          Browse the full catalog
        </Link>
      </div>
    </>
  );
};

export default Home;
