"use server";

import { books, borrowRecords, holds } from "@/database/schema";
import { db } from "@/database/drizzle";
import { requireStaff } from "@/lib/admin/guard";
import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { FREE_BOOK_LIMIT, isPro } from "@/lib/settings";

export const createBook = async (params: BookParams) => {
  const staff = await requireStaff();
  if (!staff.ok) return { success: false, message: staff.error };

  try {
    if (!(await isPro())) {
      const [total] = await db.select({ value: count() }).from(books);
      if (total.value >= FREE_BOOK_LIMIT) {
        return {
          success: false,
          message: `Campus Free includes ${FREE_BOOK_LIMIT} titles. Upgrade to Pro for an unlimited catalog.`,
        };
      }
    }
    const newBook = await db
      .insert(books)
      .values({
        ...params,
        availableCopies: params.totalCopies,
      })
      .returning();

    revalidatePath("/admin");
    revalidatePath("/admin/books");
    revalidatePath("/");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newBook[0])),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while creating the book",
    };
  }
};

export const updateBook = async (id: string, params: BookParams) => {
  const staff = await requireStaff();
  if (!staff.ok) return { success: false, message: staff.error };

  try {
    const [current] = await db
      .select({
        totalCopies: books.totalCopies,
        availableCopies: books.availableCopies,
      })
      .from(books)
      .where(eq(books.id, id))
      .limit(1);

    if (!current) {
      return { success: false, message: "Book not found" };
    }

    const copyDelta = params.totalCopies - current.totalCopies;
    const availableCopies = Math.max(0, current.availableCopies + copyDelta);

    const [updated] = await db
      .update(books)
      .set({
        ...params,
        availableCopies,
      })
      .where(eq(books.id, id))
      .returning();

    revalidatePath("/admin");
    revalidatePath("/admin/books");
    revalidatePath(`/admin/books/${id}`);
    revalidatePath("/");
    revalidatePath(`/books/${id}`);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updated)),
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "An error occurred while updating the book",
    };
  }
};

export const deleteBook = async (id: string) => {
  const staff = await requireStaff();
  if (!staff.ok) return { success: false, message: staff.error };

  try {
    const [activeBorrows] = await db
      .select({ value: count() })
      .from(borrowRecords)
      .where(
        and(eq(borrowRecords.bookId, id), eq(borrowRecords.status, "BORROWED")),
      );

    if (activeBorrows.value > 0) {
      return {
        success: false,
        message: "This book still has active borrows and cannot be deleted",
      };
    }

    await db.delete(holds).where(eq(holds.bookId, id));
    await db.delete(borrowRecords).where(eq(borrowRecords.bookId, id));
    await db.delete(books).where(eq(books.id, id));

    revalidatePath("/admin");
    revalidatePath("/admin/books");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "An error occurred while deleting the book",
    };
  }
};
