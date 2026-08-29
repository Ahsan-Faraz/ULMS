import { db } from "@/database/drizzle";
import { books, borrowRecords } from "@/database/schema";
import { and, count, desc, eq, inArray, ne, notInArray } from "drizzle-orm";

const orderBooks = (rows: Book[], ids: string[]) => {
  const byId = new Map(rows.map((book) => [book.id, book]));
  return ids
    .map((id) => byId.get(id))
    .filter((book): book is Book => Boolean(book));
};

export async function getPopularBooks(limit = 6, excludeIds: string[] = []) {
  const ranked = await db
    .select({
      bookId: books.id,
      borrows: count(borrowRecords.id),
    })
    .from(books)
    .leftJoin(borrowRecords, eq(borrowRecords.bookId, books.id))
    .where(excludeIds.length ? notInArray(books.id, excludeIds) : undefined)
    .groupBy(books.id)
    .orderBy(desc(count(borrowRecords.id)), desc(books.rating), desc(books.createdAt))
    .limit(limit);

  const ids = ranked.map((row) => row.bookId);
  if (ids.length === 0) return [];

  const rows = (await db
    .select()
    .from(books)
    .where(inArray(books.id, ids))) as Book[];

  return orderBooks(rows, ids);
}

export async function getAlsoBorrowed(bookId: string, limit = 6) {
  const peers = await db
    .selectDistinct({ userId: borrowRecords.userId })
    .from(borrowRecords)
    .where(eq(borrowRecords.bookId, bookId));

  const peerIds = peers.map((row) => row.userId);
  if (peerIds.length === 0) return [];

  const ranked = await db
    .select({
      bookId: borrowRecords.bookId,
      n: count(),
    })
    .from(borrowRecords)
    .where(
      and(inArray(borrowRecords.userId, peerIds), ne(borrowRecords.bookId, bookId)),
    )
    .groupBy(borrowRecords.bookId)
    .orderBy(desc(count()))
    .limit(limit);

  const ids = ranked.map((row) => row.bookId);
  if (ids.length === 0) return [];

  const rows = (await db
    .select()
    .from(books)
    .where(inArray(books.id, ids))) as Book[];

  return orderBooks(rows, ids);
}

export async function getRecommendedBooks(userId: string, limit = 8) {
  const history = await db
    .select({
      bookId: borrowRecords.bookId,
      genre: books.genre,
      title: books.title,
    })
    .from(borrowRecords)
    .innerJoin(books, eq(books.id, borrowRecords.bookId))
    .where(eq(borrowRecords.userId, userId))
    .orderBy(desc(borrowRecords.borrowDate));

  const borrowedIds = [...new Set(history.map((row) => row.bookId))];
  const seedTitle = history[0]?.title ?? null;

  if (borrowedIds.length === 0) {
    return {
      books: await getPopularBooks(limit),
      reason: "popular" as const,
      seedTitle: null,
    };
  }

  const collectedIds: string[] = [];
  const seen = new Set(borrowedIds);

  const peers = await db
    .selectDistinct({ userId: borrowRecords.userId })
    .from(borrowRecords)
    .where(
      and(
        inArray(borrowRecords.bookId, borrowedIds),
        ne(borrowRecords.userId, userId),
      ),
    );

  const peerIds = peers.map((row) => row.userId);

  if (peerIds.length > 0) {
    const collab = await db
      .select({
        bookId: borrowRecords.bookId,
        n: count(),
      })
      .from(borrowRecords)
      .where(
        and(
          inArray(borrowRecords.userId, peerIds),
          notInArray(borrowRecords.bookId, borrowedIds),
        ),
      )
      .groupBy(borrowRecords.bookId)
      .orderBy(desc(count()))
      .limit(limit);

    for (const row of collab) {
      if (!seen.has(row.bookId)) {
        seen.add(row.bookId);
        collectedIds.push(row.bookId);
      }
    }
  }

  if (collectedIds.length < limit) {
    const genres = [...new Set(history.map((row) => row.genre).filter(Boolean))];
    if (genres.length > 0) {
      const genreBooks = await db
        .select({ id: books.id })
        .from(books)
        .where(
          and(inArray(books.genre, genres), notInArray(books.id, [...seen])),
        )
        .orderBy(desc(books.rating), desc(books.availableCopies))
        .limit(limit - collectedIds.length);

      for (const book of genreBooks) {
        seen.add(book.id);
        collectedIds.push(book.id);
      }
    }
  }

  if (collectedIds.length < limit) {
    const popular = await getPopularBooks(limit - collectedIds.length, [...seen]);
    collectedIds.push(...popular.map((book) => book.id));
  }

  const ids = collectedIds.slice(0, limit);
  if (ids.length === 0) {
    return { books: [] as Book[], reason: "history" as const, seedTitle };
  }

  const rows = (await db
    .select()
    .from(books)
    .where(inArray(books.id, ids))) as Book[];

  return {
    books: orderBooks(rows, ids),
    reason: peerIds.length > 0 ? ("history" as const) : ("genre" as const),
    seedTitle,
  };
}
