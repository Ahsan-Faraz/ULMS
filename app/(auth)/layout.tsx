import { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import Image from "next/image";

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (session) redirect("/home");

  return (
    <main className="auth-container">
      <section className="auth-form">
        <div className="auth-box">
          <BrandMark href="/sign-in" />

          <div>{children}</div>
        </div>
      </section>

      <section className="auth-illustration">
        <div className="relative size-full overflow-hidden">
          <Image
            src="/images/auth-illustration.png"
            alt="University library reading room"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary-admin/55" />
          <div className="absolute inset-0 flex flex-col justify-end p-10 text-white sm:p-16">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Campus library
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Borrow the next book. Keep the shelf moving.
            </h2>
            <p className="mt-4 max-w-md text-white/80">
              Browse the catalog, request titles, and manage loans from one calm
              reading room.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Layout;
