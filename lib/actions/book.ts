"use server";

import { db } from "@/database/drizzle";
import { books, borrowRecords, holds, users } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import dayjs from "dayjs";
import { sendEmail } from "@/lib/workflow";
import { appUrl, borrowReceiptEmail } from "@/lib/email";
import { formatDate } from "@/lib/utils";
import { getActiveHold, getLoanDays, hasOverdueBlock } from "@/lib/circulation";

export const borrowBook = async (params: BorrowBookParams) => {
  const { userId, bookId } = params;

  try {
    const [user] = await db
      .select({
        status: users.status,
        email: users.email,
        fullName: users.fullName,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "User not found. Please sign in again." };
    }

    if (user.status !== "APPROVED") {
      return {
        success: false,
        error:
          "Your account is not approved yet. An admin must approve you before you can borrow.",
      };
    }

    if (await hasOverdueBlock(userId)) {
      return {
        success: false,
        error: "Return your overdue books before borrowing another title.",
      };
    }

    const [book] = await db
      .select({
        availableCopies: books.availableCopies,
        title: books.title,
        author: books.author,
      })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book) {
      return { success: false, error: "Book is not available for borrowing" };
    }

    const hold = await getActiveHold(userId, bookId);
    const reserved = hold?.status === "READY";

    if (!reserved && book.availableCopies <= 0) {
      return {
        success: false,
        error: "Book is not available for borrowing",
      };
    }

    const [alreadyBorrowed] = await db
      .select({ id: borrowRecords.id })
      .from(borrowRecords)
      .where(
        and(
          eq(borrowRecords.userId, userId),
          eq(borrowRecords.bookId, bookId),
          eq(borrowRecords.status, "BORROWED"),
        ),
      )
      .limit(1);

    if (alreadyBorrowed) {
      return {
        success: false,
        error: "You already have this book borrowed",
      };
    }

    const loanDays = await getLoanDays();
    const dueDate = dayjs().add(loanDays, "day").format("YYYY-MM-DD");

    const [record] = await db
      .insert(borrowRecords)
      .values({
        userId,
        bookId,
        dueDate,
        status: "BORROWED",
      })
      .returning({
        id: borrowRecords.id,
        borrowDate: borrowRecords.borrowDate,
      });

    if (!reserved) {
      await db
        .update(books)
        .set({ availableCopies: book.availableCopies - 1 })
        .where(eq(books.id, bookId));
    }

    if (hold) {
      await db
        .update(holds)
        .set({ status: "FULFILLED" })
        .where(eq(holds.id, hold.id));
    }

    try {
      await sendEmail({
        email: user.email,
        subject: `Receipt: ${book.title}`,
        message: borrowReceiptEmail({
          fullName: user.fullName,
          title: book.title,
          author: book.author,
          borrowDate: formatDate(record.borrowDate),
          dueDate: formatDate(dueDate),
          receiptUrl: `${appUrl()}/receipts/${record.id}`,
        }),
      });
    } catch (error) {
      console.log(error, "Borrow receipt email skipped");
    }

    return { success: true, borrowId: record.id };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      error: "An error occurred while borrowing the book",
    };
  }
};
