import { ReactNode } from "react";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { getBranding } from "@/lib/settings";

const Layout = async ({ children }: { children: ReactNode }) => {
  const brand = await getBranding();

  return (
    <main className="min-h-screen bg-light-300">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-8">
        <BrandMark href="/" name={brand.name} logoUrl={brand.logoUrl} />
        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link href="/pricing" className="text-dark-200 hover:text-dark-100">
            Pricing
          </Link>
          <Link href="/sign-in" className="text-dark-200 hover:text-dark-100">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            Create account
          </Link>
        </nav>
      </header>
      {children}
    </main>
  );
};

export default Layout;
