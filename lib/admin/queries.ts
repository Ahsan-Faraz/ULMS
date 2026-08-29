import { db } from "@/database/drizzle";
import { books, borrowRecords, users } from "@/database/schema";
import { and, count, desc, eq, gte, ilike, lt, or } from "drizzle-orm";
import dayjs from "dayjs";

export const PAGE_SIZE = 8;

export const parseListParams = (searchParams: {
  query?: string;
  page?: string;
  filter?: string;
}) => {
  const query = searchParams.query?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const filter = searchParams.filter ?? "all";

  return { query, page, filter };
};

export async function getAdminStats() {
  const weekAgo = dayjs().subtract(7, "day").toDate();
  const today = dayjs().format("YYYY-MM-DD");

  const [userCount] = await db.select({ value: count() }).from(users);
  const [bookCount] = await db.select({ value: count() }).from(books);
  const [borrowCount] = await db
    .select({ value: count() })
    .from(borrowRecords)
    .where(eq(borrowRecords.status, "BORROWED"));
  const [pendingCount] = await db
    .select({ value: count() })
    .from(users)
    .where(eq(users.status, "PENDING"));
  const [overdueCount] = await db
    .select({ value: count() })
    .from(borrowRecords)
    .where(
      and(
        eq(borrowRecords.status, "BORROWED"),
        lt(borrowRecords.dueDate, today),
      ),
    );

  const [newUsers] = await db
    .select({ value: count() })
    .from(users)
    .where(gte(users.createdAt, weekAgo));
  const [newBooks] = await db
    .select({ value: count() })
    .from(books)
    .where(gte(books.createdAt, weekAgo));

  return {
    users: userCount.value,
    books: bookCount.value,
    borrowed: borrowCount.value,
    pending: pendingCount.value,
    overdue: overdueCount.value,
    newUsers: newUsers.value,
    newBooks: newBooks.value,
  };
}

export async function getRecentBooks(limit = 5) {
  return db.select().from(books).orderBy(desc(books.createdAt)).limit(limit);
}

export async function getRecentUsers(limit = 6) {
  return db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      universityId: users.universityId,
      universityCard: users.universityCard,
      status: users.status,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit);
}

export async function getRecentBorrows(limit = 4) {
  return db
    .select({
      id: borrowRecords.id,
      status: borrowRecords.status,
      borrowDate: borrowRecords.borrowDate,
      dueDate: borrowRecords.dueDate,
      userName: users.fullName,
      bookTitle: books.title,
      coverColor: books.coverColor,
      coverUrl: books.coverUrl,
      author: books.author,
      genre: books.genre,
    })
    .from(borrowRecords)
    .innerJoin(users, eq(borrowRecords.userId, users.id))
    .innerJoin(books, eq(borrowRecords.bookId, books.id))
    .orderBy(desc(borrowRecords.createdAt))
    .limit(limit);
}

export async function listBooks({
  query,
  page,
}: {
  query: string;
  page: number;
}) {
  const where = query
    ? or(
        ilike(books.title, `%${query}%`),
        ilike(books.author, `%${query}%`),
        ilike(books.genre, `%${query}%`),
      )
    : undefined;

  const [totalRow] = await db.select({ value: count() }).from(books).where(where);

  const rows = await db
    .select()
    .from(books)
    .where(where)
    .orderBy(desc(books.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return {
    rows,
    total: totalRow.value,
    totalPages: Math.max(1, Math.ceil(totalRow.value / PAGE_SIZE)),
  };
}

export async function getBookById(id: string) {
  const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);
  return book ?? null;
}

export async function listUsers({
  query,
  page,
  filter,
}: {
  query: string;
  page: number;
  filter: string;
}) {
  const filters = [];

  if (query) {
    filters.push(
      or(ilike(users.fullName, `%${query}%`), ilike(users.email, `%${query}%`)),
    );
  }

  if (filter === "ADMIN" || filter === "USER") {
    filters.push(eq(users.role, filter));
  }

  if (filter === "PENDING" || filter === "APPROVED" || filter === "REJECTED") {
    filters.push(eq(users.status, filter));
  }

  const where = filters.length ? and(...filters) : undefined;

  const [totalRow] = await db.select({ value: count() }).from(users).where(where);

  const rows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      universityId: users.universityId,
      universityCard: users.universityCard,
      status: users.status,
      role: users.role,
      createdAt: users.createdAt,
      lastActivityDate: users.lastActivityDate,
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return {
    rows,
    total: totalRow.value,
    totalPages: Math.max(1, Math.ceil(totalRow.value / PAGE_SIZE)),
  };
}

export async function listAccountRequests({
  query,
  page,
}: {
  query: string;
  page: number;
}) {
  const where = query
    ? and(
        eq(users.status, "PENDING"),
        or(ilike(users.fullName, `%${query}%`), ilike(users.email, `%${query}%`)),
      )
    : eq(users.status, "PENDING");

  const [totalRow] = await db.select({ value: count() }).from(users).where(where);

  const rows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      universityId: users.universityId,
      universityCard: users.universityCard,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return {
    rows,
    total: totalRow.value,
    totalPages: Math.max(1, Math.ceil(totalRow.value / PAGE_SIZE)),
  };
}

export async function listBorrowRequests({
  query,
  page,
  filter,
}: {
  query: string;
  page: number;
  filter: string;
}) {
  const today = dayjs().format("YYYY-MM-DD");
  const filters = [];

  if (filter === "BORROWED" || filter === "RETURNED") {
    filters.push(eq(borrowRecords.status, filter));
  }

  if (filter === "OVERDUE") {
    filters.push(
      and(
        eq(borrowRecords.status, "BORROWED"),
        lt(borrowRecords.dueDate, today),
      ),
    );
  }

  if (query) {
    filters.push(
      or(
        ilike(books.title, `%${query}%`),
        ilike(users.fullName, `%${query}%`),
        ilike(users.email, `%${query}%`),
      ),
    );
  }

  const where = filters.length ? and(...filters) : undefined;

  const [totalRow] = await db
    .select({ value: count() })
    .from(borrowRecords)
    .innerJoin(users, eq(borrowRecords.userId, users.id))
    .innerJoin(books, eq(borrowRecords.bookId, books.id))
    .where(where);

  const rows = await db
    .select({
      id: borrowRecords.id,
      status: borrowRecords.status,
      borrowDate: borrowRecords.borrowDate,
      dueDate: borrowRecords.dueDate,
      returnDate: borrowRecords.returnDate,
      userName: users.fullName,
      userEmail: users.email,
      bookId: books.id,
      bookTitle: books.title,
      author: books.author,
      genre: books.genre,
      coverColor: books.coverColor,
      coverUrl: books.coverUrl,
    })
    .from(borrowRecords)
    .innerJoin(users, eq(borrowRecords.userId, users.id))
    .innerJoin(books, eq(borrowRecords.bookId, books.id))
    .where(where)
    .orderBy(desc(borrowRecords.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return {
    rows,
    total: totalRow.value,
    totalPages: Math.max(1, Math.ceil(totalRow.value / PAGE_SIZE)),
  };
}
