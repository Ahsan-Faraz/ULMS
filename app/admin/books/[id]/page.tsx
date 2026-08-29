import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import BookCover from "@/components/BookCover";
import BookVideo from "@/components/BookVideo";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { getBookById } from "@/lib/admin/queries";
import { deleteBook } from "@/lib/admin/actions/book";
import { formatDate } from "@/lib/utils";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) notFound();

  return (
    <>
      <Button asChild className="back-btn">
        <Link href="/admin/books">Go Back</Link>
      </Button>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[280px_1fr]">
        <div className="admin-panel flex flex-col items-center">
          <BookCover
            variant="wide"
            coverColor={book.coverColor}
            coverImage={book.coverUrl}
            className="mx-auto"
          />
          <div className="mt-6 flex w-full flex-col gap-2">
            <Button asChild className="bg-primary-admin text-white hover:bg-primary-admin/90">
              <Link href={`/admin/books/${book.id}/edit`}>Edit Book</Link>
            </Button>
            <ConfirmButton
              label="Delete Book"
              title="Delete this book?"
              description="This will remove the title from the catalog. Active borrows must be returned first."
              confirmText="Delete book"
              tone="danger"
              action={async () => {
                "use server";
                const result = await deleteBook(id);
                return {
                  success: result.success,
                  message: result.message,
                };
              }}
              redirectTo="/admin/books"
            />
          </div>
        </div>

        <div className="admin-panel space-y-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-light-500">
              {book.genre}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-dark-400">{book.title}</h1>
            <p className="mt-1 text-lg text-light-500">By {book.author}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-light-500">Rating</p>
              <p className="mt-1 font-semibold text-dark-400">{book.rating}/5</p>
            </div>
            <div>
              <p className="text-xs text-light-500">Total copies</p>
              <p className="mt-1 font-semibold text-dark-400">{book.totalCopies}</p>
            </div>
            <div>
              <p className="text-xs text-light-500">Available</p>
              <p className="mt-1 font-semibold text-dark-400">
                {book.availableCopies}
              </p>
            </div>
            <div>
              <p className="text-xs text-light-500">Added</p>
              <p className="mt-1 font-semibold text-dark-400">
                {formatDate(book.createdAt)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-dark-400">Description</h3>
            <p className="mt-2 text-sm leading-7 text-dark-200">{book.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-dark-400">Summary</h3>
            <div className="mt-2 space-y-3 text-sm leading-7 text-dark-200">
              {book.summary.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>

          {book.videoUrl ? (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-dark-400">Trailer</h3>
              <BookVideo videoUrl={book.videoUrl} />
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
};

export default Page;
