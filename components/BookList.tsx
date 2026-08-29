import React from "react";
import BookCard from "@/components/BookCard";

interface Props {
  title: string;
  subtitle?: string;
  books: Book[];
  containerClassName?: string;
}

const BookList = ({ title, subtitle, books, containerClassName }: Props) => {
  if (books.length === 0) return null;

  return (
    <section className={containerClassName}>
      <h2 className="font-serif text-4xl font-semibold text-dark-100">{title}</h2>
      {subtitle ? (
        <p className="mt-2 text-base text-light-100">{subtitle}</p>
      ) : null}

      <ul className="book-list">
        {books.map((book) => (
          <BookCard key={book.id} {...book} />
        ))}
      </ul>
    </section>
  );
};
export default BookList;
