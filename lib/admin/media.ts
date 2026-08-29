export const mediaSrc = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const endpoint = (
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""
  ).replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;

  return `${endpoint}${clean}`;
};
