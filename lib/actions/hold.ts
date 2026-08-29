"use server";

import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { books, holds, users } from "@/database/schema";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getActiveHold, getNextWaitingHold, hasOverdueBlock } from "@/lib/circulation";
import { isPro } from "@/lib/settings";

export const placeHold = async (bookId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please sign in again." };
  }

  if (!(await isPro())) {
    return {
      success: false,
      error: "Holds are available on Campus Pro.",
    };
  }

  const [user] = await db
    .select({ status: users.status })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (user?.status !== "APPROVED") {
    return { success: false, error: "Your account is not approved yet." };
  }

  if (await hasOverdueBlock(session.user.id)) {
    return {
      success: false,
      error: "Return overdue books before placing a hold.",
    };
  }

  const [book] = await db
    .select({ availableCopies: books.availableCopies, title: books.title })
    .from(books)
    .where(eq(books.id, bookId))
    .limit(1);

  if (!book) return { success: false, error: "Book not found" };

  if (book.availableCopies > 0) {
    return {
      success: false,
      error: "A copy is available. Borrow it instead of placing a hold.",
    };
  }

  const existing = await getActiveHold(session.user.id, bookId);
  if (existing) {
    return { success: false, error: "You already have a hold on this book." };
  }

  await db.insert(holds).values({
    userId: session.user.id,
    bookId,
    status: "WAITING",
  });

  revalidatePath(`/books/${bookId}`);
  revalidatePath("/my-profile");
  return { success: true };
};

export const cancelHold = async (holdId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please sign in again." };
  }

  const [hold] = await db
    .select()
    .from(holds)
    .where(and(eq(holds.id, holdId), eq(holds.userId, session.user.id)))
    .limit(1);

  if (!hold) return { success: false, error: "Hold not found" };

  await db
    .update(holds)
    .set({ status: "CANCELLED" })
    .where(eq(holds.id, holdId));

  if (hold.status === "READY") {
    const next = await getNextWaitingHold(hold.bookId);
    if (next) {
      await db
        .update(holds)
        .set({ status: "READY" })
        .where(eq(holds.id, next.id));
    } else {
      await db
        .update(books)
        .set({ availableCopies: sql`${books.availableCopies} + 1` })
        .where(eq(books.id, hold.bookId));
    }
  }

  revalidatePath("/my-profile");
  revalidatePath(`/books/${hold.bookId}`);
  return { success: true };
};
