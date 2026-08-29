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
  return (
    <form className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      <div className="search mt-0 flex-1">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by title, author, or genre"
          className="search-input"
        />
      </div>

      <select name="genre" defaultValue={genre} className="library-select">
        <option value="all">All genres</option>
        {genres.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select name="sort" defaultValue={sort} className="library-select">
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
