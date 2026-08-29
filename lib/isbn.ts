export type IsbnLookup = {
  title: string;
  author: string;
  description: string;
  summary: string;
  coverUrl: string;
  genre: string;
  isbn: string;
};

const digits = (value: string) => value.replace(/[^0-9Xx]/g, "");

export async function lookupIsbn(raw: string): Promise<IsbnLookup | null> {
  const isbn = digits(raw);
  if (isbn.length < 10) return null;

  const response = await fetch(
    `https://openlibrary.org/isbn/${isbn}.json`,
    { cache: "no-store" },
  );

  if (!response.ok) return null;

  const data = (await response.json()) as {
    title?: string;
    subtitle?: string;
    description?: string | { value?: string };
    subjects?: string[];
    authors?: { key: string }[];
    covers?: number[];
  };

  let author = "Unknown author";
  const authorKey = data.authors?.[0]?.key;
  if (authorKey) {
    try {
      const authorRes = await fetch(`https://openlibrary.org${authorKey}.json`, {
        cache: "no-store",
      });
      if (authorRes.ok) {
        const authorData = (await authorRes.json()) as { name?: string };
        if (authorData.name) author = authorData.name;
      }
    } catch {
      // keep fallback
    }
  }

  const description =
    typeof data.description === "string"
      ? data.description
      : data.description?.value ||
        data.subtitle ||
        `${data.title ?? "This title"} is available in the campus catalog.`;

  const coverUrl = data.covers?.[0]
    ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
    : `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

  return {
    title: data.title || "Untitled",
    author,
    description: description.slice(0, 1000),
    summary: description.slice(0, 500),
    coverUrl,
    genre: data.subjects?.[0] || "General",
    isbn,
  };
}
