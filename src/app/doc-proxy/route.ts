/**
 * Streams a file from the school's Storage bucket so the admin page can read
 * it in the browser (Storage sends no CORS headers). Only this bucket's files
 * are allowed, so the route can't be used to fetch anything else.
 */
const BUCKET = "the-elisabeth-gauba-scho-534b5.firebasestorage.app";

function allowed(raw: string | null): URL | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.hostname === "storage.googleapis.com" && url.pathname.startsWith(`/${BUCKET}/`)) return url;
  if (url.hostname === "firebasestorage.googleapis.com" && url.pathname.startsWith(`/v0/b/${BUCKET}/o/`)) return url;
  return null;
}

export async function GET(req: Request) {
  const url = allowed(new URL(req.url).searchParams.get("url"));
  if (!url) return new Response("URL not allowed", { status: 400 });

  const upstream = await fetch(url, { redirect: "error" }).catch(() => null);
  if (!upstream || !upstream.ok || !upstream.body) return new Response("Could not fetch file", { status: 502 });

  return new Response(upstream.body, {
    headers: {
      "content-type": upstream.headers.get("content-type") || "application/octet-stream",
      "cache-control": "private, no-store",
    },
  });
}
