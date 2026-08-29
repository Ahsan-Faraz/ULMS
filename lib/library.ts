import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { and, asc, count, desc, eq, ilike, ne, or } from "drizzle-orm";

export const LIBRARY_PAGE_SIZE = 12;

export type LibrarySort =
  | "newest"
  | "oldest"
  | "title"
  | "rating"
  | "available";

export const parseLibraryParams = (searchParams: {
  q?: string;
  genre?: string;
  sort?: string;
  page?: string;
}) => {
  const q = searchParams.q?.trim() ?? "";
  const genre = searchParams.genre?.trim() ?? "all";
  const allowed: LibrarySort[] = [
    "newest",
    "oldest",
    "title",
    "rating",
    "available",
  ];
  const sort = allowed.includes(searchParams.sort as LibrarySort)
    ? (searchParams.sort as LibrarySort)
    : "newest";
  const page = Math.max(1, Number(searchParams.page) || 1);

  return { q, genre, sort, page };
};

export async function getLibraryGenres() {
  const rows = await db
    .select({ genre: books.genre })
    .from(books)
    .groupBy(books.genre)
    .orderBy(asc(books.genre));

  return rows.map((row) => row.genre).filter(Boolean);
}

export async function getLibraryBooks({
  q,
  genre,
  sort,
  page,
}: {
  q: string;
  genre: string;
  sort: LibrarySort;
  page: number;
}) {
  const filters = [];

  if (q) {
    const term = `%${q}%`;
    const search = or(
      ilike(books.title, term),
      ilike(books.author, term),
      ilike(books.genre, term),
    );
    if (search) filters.push(search);
  }

  if (genre && genre !== "all") {
    filters.push(ilike(books.genre, `%${genre}%`));
  }

  const where = filters.length ? and(...filters) : undefined;

  const orderBy = {
    newest: desc(books.createdAt),
    oldest: asc(books.createdAt),
    title: asc(books.title),
    rating: desc(books.rating),
    available: desc(books.availableCopies),
  }[sort];

  const [totalRow] = await db
    .select({ value: count() })
    .from(books)
    .where(where);

  const items = await db
    .select()
    .from(books)
    .where(where)
    .orderBy(orderBy)
    .limit(LIBRARY_PAGE_SIZE)
    .offset((page - 1) * LIBRARY_PAGE_SIZE);

  return {
    books: items as Book[],
    total: totalRow.value,
    totalPages: Math.max(1, Math.ceil(totalRow.value / LIBRARY_PAGE_SIZE)),
  };
}

export async function getSimilarBooks(bookId: string, genre: string, limit = 6) {
  const similar = (await db
    .select()
    .from(books)
    .where(and(eq(books.genre, genre), ne(books.id, bookId)))
    .orderBy(desc(books.rating), desc(books.createdAt))
    .limit(limit)) as Book[];

  if (similar.length > 0) return similar;

  return (await db
    .select()
    .from(books)
    .where(ne(books.id, bookId))
    .orderBy(desc(books.createdAt))
    .limit(limit)) as Book[];
}
