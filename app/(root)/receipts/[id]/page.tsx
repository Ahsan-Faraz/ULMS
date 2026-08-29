import { notFound } from "next/navigation";
import BookCover from "@/components/BookCover";
import PrintReceiptButton from "@/components/PrintReceiptButton";
import { getBorrowReceipt } from "@/lib/actions/profile";
import { formatDate } from "@/lib/utils";
import { APP_NAME } from "@/lib/brand";
import Link from "next/link";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const receipt = await getBorrowReceipt(id);

  if (!receipt) notFound();

  return (
    <section className="mx-auto max-w-xl">
      <div className="no-print mb-8 flex items-center justify-between">
        <Link href="/my-profile" className="text-sm font-medium text-primary">
          Back to profile
        </Link>
        <PrintReceiptButton />
      </div>

      <article className="rounded-2xl border border-light-400 bg-light-600 p-8">
        <p className="library-subtitle">{APP_NAME} receipt</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-dark-100">
          Borrow receipt
        </h1>

        <div className="mt-8 flex gap-5">
          <BookCover
            variant="small"
            coverColor={receipt.book.coverColor}
            coverImage={receipt.book.coverUrl}
          />
          <div>
            <p className="font-serif text-2xl font-semibold text-dark-100">
              {receipt.book.title}
            </p>
            <p className="mt-1 text-light-100">By {receipt.book.author}</p>
            <p className="mt-1 text-sm italic text-light-100">
              {receipt.book.genre}
            </p>
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-light-400 p-3">
            <dt className="text-light-100">Borrower</dt>
            <dd className="mt-1 font-semibold text-dark-100">
              {receipt.userName}
            </dd>
          </div>
          <div className="rounded-xl border border-light-400 p-3">
            <dt className="text-light-100">University ID</dt>
            <dd className="mt-1 font-semibold text-dark-100">
              {receipt.universityId}
            </dd>
          </div>
          <div className="rounded-xl border border-light-400 p-3">
            <dt className="text-light-100">Borrowed</dt>
            <dd className="mt-1 font-semibold text-dark-100">
              {formatDate(receipt.borrowDate)}
            </dd>
          </div>
          <div className="rounded-xl border border-light-400 p-3">
            <dt className="text-light-100">Due</dt>
            <dd className="mt-1 font-semibold text-dark-100">
              {formatDate(receipt.dueDate)}
            </dd>
          </div>
          <div className="rounded-xl border border-light-400 p-3">
            <dt className="text-light-100">Status</dt>
            <dd className="mt-1 font-semibold text-dark-100">{receipt.status}</dd>
          </div>
          <div className="rounded-xl border border-light-400 p-3">
            <dt className="text-light-100">Returned</dt>
            <dd className="mt-1 font-semibold text-dark-100">
              {formatDate(receipt.returnDate)}
            </dd>
          </div>
        </dl>

        <p className="mt-8 text-xs text-light-100">Receipt #{receipt.id}</p>
      </article>
    </section>
  );
};

export default Page;
