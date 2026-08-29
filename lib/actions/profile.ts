"use server";

import { db } from "@/database/drizzle";
import { books, borrowRecords, users } from "@/database/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function getBorrowedBooks(userId: string) {
  const records = await db
    .select({
      borrowId: borrowRecords.id,
      borrowDate: borrowRecords.borrowDate,
      dueDate: borrowRecords.dueDate,
      returnDate: borrowRecords.returnDate,
      borrowStatus: borrowRecords.status,
      book: books,
    })
    .from(borrowRecords)
    .innerJoin(books, eq(borrowRecords.bookId, books.id))
    .where(eq(borrowRecords.userId, userId))
    .orderBy(desc(borrowRecords.borrowDate));

  return records.map((record) => ({
    ...record.book,
    borrowId: record.borrowId,
    borrowDate: record.borrowDate,
    dueDate: record.dueDate,
    returnDate: record.returnDate,
    borrowStatus: record.borrowStatus,
    isLoanedBook: record.borrowStatus === "BORROWED",
  }));
}

export async function getBorrowReceipt(borrowId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [receipt] = await db
    .select({
      id: borrowRecords.id,
      borrowDate: borrowRecords.borrowDate,
      dueDate: borrowRecords.dueDate,
      returnDate: borrowRecords.returnDate,
      status: borrowRecords.status,
      userId: borrowRecords.userId,
      userName: users.fullName,
      userEmail: users.email,
      universityId: users.universityId,
      book: books,
    })
    .from(borrowRecords)
    .innerJoin(books, eq(borrowRecords.bookId, books.id))
    .innerJoin(users, eq(borrowRecords.userId, users.id))
    .where(eq(borrowRecords.id, borrowId))
    .limit(1);

  if (!receipt) return null;

  const [viewer] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (receipt.userId !== session.user.id && viewer?.role !== "ADMIN") {
    return null;
  }

  return receipt;
}
