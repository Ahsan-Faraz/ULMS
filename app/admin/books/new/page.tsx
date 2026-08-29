import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BookForm from "@/components/admin/forms/BookForm";
import { isPro } from "@/lib/settings";

const Page = async () => {
  const isbnEnabled = await isPro();

  return (
    <>
      <Button asChild className="back-btn">
        <Link href="/admin/books">Go Back</Link>
      </Button>

      <section className="w-full max-w-2xl">
        <BookForm isbnEnabled={isbnEnabled} />
      </section>
    </>
  );
};
export default Page;
