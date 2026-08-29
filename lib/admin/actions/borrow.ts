"use server";

import { db } from "@/database/drizzle";
import { books, borrowRecords, holds, users } from "@/database/schema";
import { requireStaff } from "@/lib/admin/guard";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import dayjs from "dayjs";
import { getNextWaitingHold } from "@/lib/circulation";
import { sendEmail } from "@/lib/workflow";
import { appUrl, holdReadyEmail } from "@/lib/email";

const revalidateLoans = () => {
  revalidatePath("/admin");
  revalidatePath("/admin/book-requests");
  revalidatePath("/admin/books");
  revalidatePath("/home");
  revalidatePath("/my-profile");
};

export const markBorrowReturned = async (borrowId: string) => {
  const staff = await requireStaff();
  if (!staff.ok) return { success: false, message: staff.error };

  try {
    const [record] = await db
      .select()
      .from(borrowRecords)
      .where(eq(borrowRecords.id, borrowId))
      .limit(1);

    if (!record) return { success: false, message: "Borrow record not found" };

    if (record.status === "RETURNED") {
      return { success: true };
    }

    await db
      .update(borrowRecords)
      .set({
        status: "RETURNED",
        returnDate: dayjs().format("YYYY-MM-DD"),
      })
      .where(eq(borrowRecords.id, borrowId));

    const nextHold = await getNextWaitingHold(record.bookId);

    if (nextHold) {
      await db
        .update(holds)
        .set({ status: "READY" })
        .where(eq(holds.id, nextHold.id));

      const [patron] = await db
        .select({ email: users.email, fullName: users.fullName })
        .from(users)
        .where(eq(users.id, nextHold.userId))
        .limit(1);
      const [book] = await db
        .select({ title: books.title })
        .from(books)
        .where(eq(books.id, record.bookId))
        .limit(1);

      if (patron && book) {
        try {
          await sendEmail({
            email: patron.email,
            subject: `Ready for pickup: ${book.title}`,
            message: holdReadyEmail({
              fullName: patron.fullName,
              title: book.title,
              borrowUrl: `${appUrl()}/books/${record.bookId}`,
            }),
          });
        } catch (error) {
          console.log(error, "Hold ready email skipped");
        }
      }
    } else {
      await db
        .update(books)
        .set({ availableCopies: sql`${books.availableCopies} + 1` })
        .where(eq(books.id, record.bookId));
    }

    revalidateLoans();
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Could not mark this book as returned" };
  }
};

export const checkoutForStudent = async ({
  userId,
  bookId,
}: {
  userId: string;
  bookId: string;
}) => {
  const staff = await requireStaff();
  if (!staff.ok) return { success: false, message: staff.error };

  const { borrowBook } = await import("@/lib/actions/book");
  const result = await borrowBook({ userId, bookId });

  if (!result.success) {
    return { success: false, message: result.error };
  }

  revalidateLoans();
  revalidatePath("/admin/checkout");
  return { success: true, borrowId: result.borrowId };
};
