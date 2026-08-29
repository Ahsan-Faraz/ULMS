import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { books, borrowRecords, users } from "@/database/schema";
import { and, eq, lt } from "drizzle-orm";
import dayjs from "dayjs";
import { sendEmail } from "@/lib/workflow";
import { dueSoonEmail, overdueEmail } from "@/lib/email";
import { formatDate } from "@/lib/utils";
import redis from "@/database/redis";

const isAuthorized = (request: NextRequest) => {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const vercelCron = request.headers.get("x-vercel-cron");

  if (secret && authHeader === `Bearer ${secret}`) return true;
  if (vercelCron) return true;
  if (!secret && process.env.NODE_ENV !== "production") return true;

  return false;
};

const claimReminder = async (kind: "due" | "overdue", id: string) => {
  const key = `folio:reminder:${kind}:${id}`;
  const created = await redis.set(key, "1", { nx: true, ex: 60 * 60 * 24 * 14 });
  return created === "OK";
};

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = dayjs().format("YYYY-MM-DD");
  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");

  const dueSoon = await db
    .select({
      id: borrowRecords.id,
      dueDate: borrowRecords.dueDate,
      email: users.email,
      fullName: users.fullName,
      title: books.title,
    })
    .from(borrowRecords)
    .innerJoin(users, eq(borrowRecords.userId, users.id))
    .innerJoin(books, eq(borrowRecords.bookId, books.id))
    .where(
      and(eq(borrowRecords.status, "BORROWED"), eq(borrowRecords.dueDate, tomorrow)),
    );

  const overdue = await db
    .select({
      id: borrowRecords.id,
      dueDate: borrowRecords.dueDate,
      email: users.email,
      fullName: users.fullName,
      title: books.title,
    })
    .from(borrowRecords)
    .innerJoin(users, eq(borrowRecords.userId, users.id))
    .innerJoin(books, eq(borrowRecords.bookId, books.id))
    .where(
      and(eq(borrowRecords.status, "BORROWED"), lt(borrowRecords.dueDate, today)),
    );

  let dueSent = 0;
  let overdueSent = 0;

  for (const loan of dueSoon) {
    try {
      const claimed = await claimReminder("due", loan.id);
      if (!claimed) continue;

      await sendEmail({
        email: loan.email,
        subject: `Due soon: ${loan.title}`,
        message: dueSoonEmail({
          fullName: loan.fullName,
          title: loan.title,
          dueDate: formatDate(loan.dueDate),
        }),
      });
      dueSent += 1;
    } catch (error) {
      console.log(error, "Due-soon email skipped");
    }
  }

  for (const loan of overdue) {
    try {
      const claimed = await claimReminder("overdue", loan.id);
      if (!claimed) continue;

      await sendEmail({
        email: loan.email,
        subject: `Overdue: ${loan.title}`,
        message: overdueEmail({
          fullName: loan.fullName,
          title: loan.title,
          dueDate: formatDate(loan.dueDate),
        }),
      });
      overdueSent += 1;
    } catch (error) {
      console.log(error, "Overdue email skipped");
    }
  }

  return NextResponse.json({
    ok: true,
    dueSoon: dueSent,
    overdue: overdueSent,
  });
}
