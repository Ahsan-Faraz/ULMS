import Link from "next/link";
import { Button } from "@/components/ui/button";
import BookCover from "@/components/BookCover";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import { listBooks, parseListParams } from "@/lib/admin/queries";
import { formatDate } from "@/lib/utils";
import { Eye, Pencil } from "lucide-react";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) => {
  const params = parseListParams(await searchParams);
  const { rows, total, totalPages } = await listBooks(params);

  return (
    <section className="admin-panel">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-dark-400">All Books</h2>
          <p className="text-sm text-light-500">{total} titles in the catalog</p>
        </div>
        <Button className="bg-primary-admin text-white hover:bg-primary-admin/90" asChild>
          <Link href="/admin/books/new">+ Create a New Book</Link>
        </Button>
      </div>

      <div className="admin-table-wrap mt-7">
        {rows.length === 0 ? (
          <EmptyState
            title="No books found"
            description="Try another search or add the first title to the library."
          />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Author</th>
                <th>Genre</th>
                <th>Copies</th>
                <th>Added</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((book) => (
                <tr key={book.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <BookCover
                        variant="extraSmall"
                        coverColor={book.coverColor}
                        coverImage={book.coverUrl}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-dark-400">{book.title}</p>
                        <p className="text-xs text-light-500">
                          Rating {book.rating}/5
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>{book.author}</td>
                  <td>{book.genre}</td>
                  <td>
                    {book.availableCopies}/{book.totalCopies}
                  </td>
                  <td>{formatDate(book.createdAt)}</td>
                  <td>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/books/${book.id}`}
                        className="rounded-lg bg-light-300 p-2 text-primary-admin"
                      >
                        <Eye className="size-4" />
                      </Link>
                      <Link
                        href={`/admin/books/${book.id}/edit`}
                        className="rounded-lg bg-light-300 p-2 text-dark-400"
                      >
                        <Pencil className="size-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={params.page} totalPages={totalPages} query={params.query} />
    </section>
  );
};

export default Page;
