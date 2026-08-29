import { db } from "@/database/drizzle";
import { books, borrowRecords, holds } from "@/database/schema";
import { and, asc, count, eq, inArray, lt } from "drizzle-orm";
import dayjs from "dayjs";
import { FINE_PER_DAY, getLibrarySettings } from "@/lib/settings";

export async function getLoanDays() {
  const settings = await getLibrarySettings();
  return Math.max(1, settings.loanDays || 7);
}

export function daysOverdue(dueDate?: string | Date | null) {
  if (!dueDate) return 0;
  const due = dayjs(dueDate).startOf("day");
  const today = dayjs().startOf("day");
  const diff = today.diff(due, "day");
  return diff > 0 ? diff : 0;
}

export function overdueFine(dueDate?: string | Date | null) {
  return daysOverdue(dueDate) * FINE_PER_DAY;
}

export async function getOverdueLoans(userId: string) {
  const today = dayjs().format("YYYY-MM-DD");

  return db
    .select({
      id: borrowRecords.id,
      bookId: borrowRecords.bookId,
      dueDate: borrowRecords.dueDate,
      title: books.title,
    })
    .from(borrowRecords)
    .innerJoin(books, eq(borrowRecords.bookId, books.id))
    .where(
      and(
        eq(borrowRecords.userId, userId),
        eq(borrowRecords.status, "BORROWED"),
        lt(borrowRecords.dueDate, today),
      ),
    );
}

export async function hasOverdueBlock(userId: string) {
  const overdue = await getOverdueLoans(userId);
  return overdue.length > 0;
}

export async function countWaitingHolds(bookId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(holds)
    .where(and(eq(holds.bookId, bookId), eq(holds.status, "WAITING")));

  return row.value;
}

export async function getActiveHold(userId: string, bookId: string) {
  const [hold] = await db
    .select()
    .from(holds)
    .where(
      and(
        eq(holds.userId, userId),
        eq(holds.bookId, bookId),
        inArray(holds.status, ["WAITING", "READY"]),
      ),
    )
    .limit(1);

  return hold ?? null;
}

export async function getNextWaitingHold(bookId: string) {
  const [hold] = await db
    .select()
    .from(holds)
    .where(and(eq(holds.bookId, bookId), eq(holds.status, "WAITING")))
    .orderBy(asc(holds.createdAt))
    .limit(1);

  return hold ?? null;
}

export async function getUserHolds(userId: string) {
  return db
    .select({
      id: holds.id,
      status: holds.status,
      createdAt: holds.createdAt,
      bookId: books.id,
      title: books.title,
      author: books.author,
      coverColor: books.coverColor,
      coverUrl: books.coverUrl,
    })
    .from(holds)
    .innerJoin(books, eq(holds.bookId, books.id))
    .where(
      and(
        eq(holds.userId, userId),
        inArray(holds.status, ["WAITING", "READY"]),
      ),
    )
    .orderBy(asc(holds.createdAt));
}
