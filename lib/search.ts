import { SQL, sql } from "drizzle-orm";
import { books } from "@/database/schema";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
]);

export const catalogSearchDocument = sql`(
  setweight(to_tsvector('english', coalesce(${books.title}, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(${books.author}, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(${books.genre}, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(${books.isbn}, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(${books.summary}, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(${books.description}, '')), 'D')
)`;

export function sanitizeSearchTokens(q: string) {
  return q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/[\s-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

export function prefixTsQuery(q: string) {
  const tokens = sanitizeSearchTokens(q);
  if (tokens.length === 0) return "";
  return tokens.map((token) => `${token}:*`).join(" & ");
}

export function catalogSearchRank(q: string): SQL<number> {
  const prefix = prefixTsQuery(q);
  if (!prefix) return sql<number>`0`;
  return sql<number>`ts_rank(${catalogSearchDocument}, to_tsquery('english', ${prefix}))`;
}
