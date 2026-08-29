"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LIBRARY_SORTS } from "@/constants";

const LibraryFilters = ({
  q,
  genre,
  sort,
  genres,
}: {
  q: string;
  genre: string;
  sort: string;
  genres: string[];
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(q);
  const [lockAutofill, setLockAutofill] = useState(true);

  useEffect(() => {
    setQuery(q);
  }, [q]);

  const apply = (next: { q?: string; genre?: string; sort?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextQuery = next.q ?? query;
    const nextGenre = next.genre ?? genre;
    const nextSort = next.sort ?? sort;

    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    else params.delete("q");

    if (nextGenre && nextGenre !== "all") params.set("genre", nextGenre);
    else params.delete("genre");

    const implicitSort = nextQuery.trim() ? "relevance" : "newest";
    if (nextSort && nextSort !== implicitSort) params.set("sort", nextSort);
    else params.delete("sort");

    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    apply({ q: query });
  };

  return (
    <form
      onSubmit={onSubmit}
      autoComplete="off"
      className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center"
    >
      <div className="search mt-0 flex-1">
        <input
          type="text"
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
        <input
          type="text"
          name="libris-catalog"
          value={query}
          readOnly={lockAutofill}
          onFocus={() => setLockAutofill(false)}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search titles, authors, or topics"
          className="search-input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-autocomplete="none"
          data-lpignore="true"
          data-1p-ignore="true"
          data-form-type="other"
        />
      </div>

      <select
        name="genre"
        value={genre}
        onChange={(event) => apply({ genre: event.target.value, q: query })}
        className="library-select"
      >
        <option value="all">All genres</option>
        {genres.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        name="sort"
        value={sort}
        onChange={(event) => apply({ sort: event.target.value, q: query })}
        className="library-select"
      >
        {LIBRARY_SORTS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="h-12 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/90"
      >
        Search
      </button>
    </form>
  );
};

export default LibraryFilters;
