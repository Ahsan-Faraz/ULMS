import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
import BookVideo from "@/components/BookVideo";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSimilarBooks } from "@/lib/library";
import { getAlsoBorrowed } from "@/lib/recommendations";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;
  const session = await auth();

  const [bookDetails] = await db
    .select()
    .from(books)
    .where(eq(books.id, id))
    .limit(1);

  if (!bookDetails) redirect("/404");

  const [similarBooks, alsoBorrowed] = await Promise.all([
    getSimilarBooks(id, bookDetails.genre),
    getAlsoBorrowed(id, 6),
  ]);
  const alsoBorrowedIds = new Set(alsoBorrowed.map((book) => book.id));
  const moreInGenre = similarBooks.filter((book) => !alsoBorrowedIds.has(book.id));

  return (
    <>
      <BookOverview {...bookDetails} userId={session?.user?.id as string} />

      <div className="book-details">
        <div className="flex-[1.5]">
          <section className="flex flex-col gap-7">
            <h3>Video</h3>

            <BookVideo videoUrl={bookDetails.videoUrl} />
          </section>
          <section className="mt-10 flex flex-col gap-7">
            <h3>Summary</h3>

            <div className="space-y-5 text-xl text-light-100">
              {bookDetails.summary.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </section>
        </div>

        <div className="flex-1 space-y-16">
          <BookList
            title="Readers also borrowed"
            books={alsoBorrowed}
          />
          <BookList
            title="More in this genre"
            books={moreInGenre}
          />
        </div>
      </div>
    </>
  );
};

export default Page;
