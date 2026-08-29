import React from "react";
import BookCard from "@/components/BookCard";

interface Props {
  title: string;
  books: Book[];
  containerClassName?: string;
}

const BookList = ({ title, books, containerClassName }: Props) => {
  if (books.length === 0) return null;

  return (
    <section className={containerClassName}>
      <h2 className="font-serif text-4xl font-semibold text-dark-100">{title}</h2>

      <ul className="book-list">
        {books.map((book) => (
          <BookCard key={book.id} {...book} />
        ))}
      </ul>
    </section>
  );
};
export default BookList;
