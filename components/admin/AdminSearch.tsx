"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";

const AdminSearch = ({ placeholder }: { placeholder: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("query") ?? "");

  useEffect(() => {
    setValue(searchParams.get("query") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.get("query") ?? "";

      if (value === current) return;

      if (value) params.set("query", value);
      else params.delete("query");
      params.delete("page");

      router.replace(`${pathname}?${params.toString()}`);
    }, 350);

    return () => clearTimeout(timeout);
  }, [value, pathname, router, searchParams]);

  return (
    <div className="admin-search">
      <Image
        src="/icons/search-fill.svg"
        alt="search"
        width={20}
        height={20}
        className="opacity-50"
      />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="admin-search_input"
      />
    </div>
  );
};

export default AdminSearch;
