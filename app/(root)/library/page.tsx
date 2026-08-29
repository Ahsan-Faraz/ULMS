import BookCard from "@/components/BookCard";
import LibraryFilters from "@/components/LibraryFilters";
import LibraryPagination from "@/components/LibraryPagination";
import {
  getLibraryBooks,
  getLibraryGenres,
  parseLibraryParams,
} from "@/lib/library";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    sort?: string;
    page?: string;
  }>;
}) => {
  const params = parseLibraryParams(await searchParams);
  const [genres, catalog] = await Promise.all([
    getLibraryGenres(),
    getLibraryBooks(params),
  ]);

  return (
    <section>
      <div className="library">
        <p className="library-subtitle">The catalog</p>
        <h1 className="library-title">Find your next book</h1>
      </div>

      <LibraryFilters
        q={params.q}
        genre={params.genre}
        sort={params.sort}
        genres={genres}
      />

      <p className="mt-6 text-sm text-light-100">
        {catalog.total} {catalog.total === 1 ? "title" : "titles"}
      </p>

      {catalog.books.length === 0 ? (
        <p className="mt-16 text-center text-light-100">
          No books match that search. Try a different title, author, or genre.
        </p>
      ) : (
        <ul className="book-list">
          {catalog.books.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </ul>
      )}

      <LibraryPagination
        page={params.page}
        totalPages={catalog.totalPages}
        q={params.q}
        genre={params.genre}
        sort={params.sort}
      />
    </section>
  );
};

export default Page;
