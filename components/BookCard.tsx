import Link from "next/link";
import BookCover from "@/components/BookCover";
import { cn, getDueLabel } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const BookCard = ({
  id,
  title,
  genre,
  coverColor,
  coverUrl,
  isLoanedBook = false,
  borrowId,
  dueDate,
}: Book) => (
  <li className={cn(isLoanedBook && "xs:w-52 w-full")}>
    <Link
      href={`/books/${id}`}
      className={cn(isLoanedBook && "w-full flex flex-col items-center")}
    >
      <BookCover coverColor={coverColor} coverImage={coverUrl} />

      <div className={cn("mt-4", !isLoanedBook && "xs:max-w-40 max-w-28")}>
        <p className="book-title">{title}</p>
        <p className="book-genre">{genre}</p>
      </div>
    </Link>

    {isLoanedBook && (
      <div className="mt-3 w-full">
        <div className="book-loaned">
          <Image
            src="/icons/calendar.svg"
            alt="calendar"
            width={18}
            height={18}
            className="object-contain"
          />
          <p className="text-light-100">{getDueLabel(dueDate)}</p>
        </div>

        {borrowId ? (
          <Button className="book-btn" asChild>
            <Link href={`/receipts/${borrowId}`}>Download receipt</Link>
          </Button>
        ) : null}
      </div>
    )}
  </li>
);

export default BookCard;
