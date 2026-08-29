"use server";

import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { borrowRecords } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import { countWaitingHolds, getLoanDays, hasOverdueBlock } from "@/lib/circulation";

export const renewBorrow = async (borrowId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please sign in again." };
  }

  const [record] = await db
    .select()
    .from(borrowRecords)
    .where(
      and(
        eq(borrowRecords.id, borrowId),
        eq(borrowRecords.userId, session.user.id),
      ),
    )
    .limit(1);

  if (!record || record.status !== "BORROWED") {
    return { success: false, error: "Loan not found." };
  }

  if (record.renewed) {
    return { success: false, error: "This loan has already been renewed once." };
  }

  if (await hasOverdueBlock(session.user.id)) {
    return {
      success: false,
      error: "Overdue loans cannot be renewed. Return the book first.",
    };
  }

  if ((await countWaitingHolds(record.bookId)) > 0) {
    return {
      success: false,
      error: "Someone is waiting for this title, so it cannot be renewed.",
    };
  }

  const loanDays = await getLoanDays();
  const dueDate = dayjs(record.dueDate).add(loanDays, "day").format("YYYY-MM-DD");

  await db
    .update(borrowRecords)
    .set({ dueDate, renewed: true })
    .where(eq(borrowRecords.id, borrowId));

  revalidatePath("/my-profile");
  return { success: true, dueDate };
};
