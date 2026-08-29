"use server";

import { db } from "@/database/drizzle";
import { books, borrowRecords } from "@/database/schema";
import { requireAdmin } from "@/lib/admin/guard";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import dayjs from "dayjs";

export const markBorrowReturned = async (borrowId: string) => {
  const admin = await requireAdmin();
  if (!admin.ok) return { success: false, message: admin.error };

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

    await db
      .update(books)
      .set({ availableCopies: sql`${books.availableCopies} + 1` })
      .where(eq(books.id, record.bookId));

    revalidatePath("/admin");
    revalidatePath("/admin/book-requests");
    revalidatePath("/admin/books");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Could not mark this book as returned" };
  }
};
