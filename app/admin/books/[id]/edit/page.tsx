import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import BookForm from "@/components/admin/forms/BookForm";
import { getBookById } from "@/lib/admin/queries";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) notFound();

  return (
    <>
      <Button asChild className="back-btn">
        <Link href={`/admin/books/${book.id}`}>Go Back</Link>
      </Button>

      <section className="w-full max-w-2xl">
        <h2 className="mb-6 text-2xl font-semibold text-dark-400">Edit Book</h2>
        <BookForm type="update" {...book} />
      </section>
    </>
  );
};

export default Page;
