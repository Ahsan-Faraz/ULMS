import Link from "next/link";
import { FREE_BOOK_LIMIT } from "@/lib/settings";

const Page = () => {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-24">
      <p className="library-subtitle">Pricing</p>
      <h1 className="mt-3 font-serif text-5xl font-semibold text-dark-100">
        Start free. Grow when the catalog does.
      </h1>
      <p className="mt-4 max-w-2xl text-light-100">
        One campus library. No tenants, no extra seats until you need Pro
        circulation tools.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-light-400 bg-light-600 p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-light-100">
            Campus Free
          </p>
          <p className="mt-3 font-serif text-4xl text-dark-100">$0</p>
          <ul className="mt-6 space-y-2 text-dark-200">
            <li>Catalog, borrow, and student approval</li>
            <li>Up to {FREE_BOOK_LIMIT} titles</li>
            <li>One admin</li>
            <li>7-day loans you can change in settings</li>
          </ul>
          <Link
            href="/sign-up"
            className="mt-8 inline-flex rounded-xl border border-light-400 px-5 py-3 font-semibold text-dark-100"
          >
            Create a library
          </Link>
        </article>

        <article className="rounded-2xl bg-primary-admin p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
            Campus Pro
          </p>
          <p className="mt-3 font-serif text-4xl">$19 / month</p>
          <ul className="mt-6 space-y-2 text-white/85">
            <li>Unlimited catalog</li>
            <li>Holds when copies are out</li>
            <li>ISBN lookup when adding books</li>
            <li>Due-soon and overdue email</li>
            <li>Custom name, logo, and email from</li>
          </ul>
          <Link
            href="/sign-in"
            className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-primary-admin"
          >
            Sign in to upgrade
          </Link>
        </article>
      </div>
    </section>
  );
};

export default Page;
