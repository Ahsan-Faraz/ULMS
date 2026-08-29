import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getBranding } from "@/lib/settings";

const Page = async () => {
  const session = await auth();
  if (session) redirect("/home");

  const brand = await getBranding();

  return (
    <section className="mx-auto max-w-6xl px-5 pb-24">
      <div className="max-w-3xl pt-10">
        <p className="library-subtitle">Campus library software</p>
        <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight text-dark-100 md:text-7xl">
          {brand.name} keeps the shelf moving.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-light-100">
          Students browse and borrow. Staff approve accounts, check books in,
          and keep due dates honest. One calm reading room for the whole campus.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/sign-up"
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
          >
            Start a campus library
          </Link>
          <Link
            href="/pricing"
            className="rounded-xl border border-light-400 bg-light-600 px-6 py-3 font-semibold text-dark-100"
          >
            See plans
          </Link>
        </div>
      </div>

      <div className="mt-20 grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Catalog and borrow",
            copy: "Search the collection, check copies, and take a book home for a set loan period.",
          },
          {
            title: "Circulation desk",
            copy: "Staff can check out for a student, mark returns, and honor holds when a copy comes back.",
          },
          {
            title: "Campus Pro",
            copy: "ISBN import, hold queues, due-date email, and your own name on the door.",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-light-400 bg-light-600 p-6"
          >
            <h2 className="font-serif text-2xl font-semibold text-dark-100">
              {item.title}
            </h2>
            <p className="mt-3 text-light-100">{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Page;
