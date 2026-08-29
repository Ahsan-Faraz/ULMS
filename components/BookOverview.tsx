import React from "react";
import Image from "next/image";
import BookCover from "@/components/BookCover";
import BorrowBook from "@/components/BorrowBook";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { getActiveHold, hasOverdueBlock } from "@/lib/circulation";
import { isPro } from "@/lib/settings";

interface Props extends Book {
  userId: string;
}
const BookOverview = async ({
  title,
  author,
  genre,
  rating,
  totalCopies,
  availableCopies,
  description,
  coverColor,
  coverUrl,
  id,
  userId,
}: Props) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const hold = user ? await getActiveHold(user.id, id) : null;
  const overdue = user ? await hasOverdueBlock(user.id) : false;
  const pro = await isPro();

  let action: "borrow" | "hold" | "ready" | "blocked" = "borrow";
  let message = "";

  if (!user || user.status !== "APPROVED") {
    action = "blocked";
    message = "Your account is not approved yet.";
  } else if (overdue) {
    action = "blocked";
    message = "Return overdue books before borrowing again.";
  } else if (hold?.status === "READY") {
    action = "ready";
  } else if (hold?.status === "WAITING") {
    action = "blocked";
    message = "You already have a hold on this title.";
  } else if (availableCopies <= 0) {
    action = "hold";
    message = pro
      ? "No copies left. Place a hold to be next in line."
      : "No copies left. Holds are included with Campus Pro.";
  }

  return (
    <section className="book-overview">
      <div className="flex flex-1 flex-col gap-5">
        <h1>{title}</h1>

        <div className="book-info">
          <p>
            By <span className="font-semibold text-light-200">{author}</span>
          </p>

          <p>
            Category{" "}
            <span className="font-semibold text-light-200">{genre}</span>
          </p>

          <div className="flex flex-row gap-1">
            <Image src="/icons/star.svg" alt="star" width={22} height={22} />
            <p>{rating}</p>
          </div>
        </div>

        <div className="book-copies">
          <p>
            Total Books <span>{totalCopies}</span>
          </p>

          <p>
            Available Books <span>{availableCopies}</span>
          </p>
        </div>

        <p className="book-description">{description}</p>
        {message ? <p className="text-sm text-light-100">{message}</p> : null}

        {user && (
          <BorrowBook
            bookId={id}
            userId={userId}
            action={action}
            message={message}
            holdIsPro={pro}
          />
        )}
      </div>

      <div className="relative flex flex-1 justify-center">
        <div className="relative">
          <BookCover
            variant="wide"
            className="z-10"
            coverColor={coverColor}
            coverImage={coverUrl}
          />

          <div className="absolute left-16 top-10 rotate-12 opacity-40 max-sm:hidden">
            <BookCover
              variant="wide"
              coverColor={coverColor}
              coverImage={coverUrl}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookOverview;
