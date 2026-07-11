import type { NextConfig } from "next";
import { pages } from "./src/lib/site";

// 301-redirect every legacy .html / .aspx URL to its new clean slug so we
// keep the SEO value of the old, indexed URLs.
const legacyRedirects = pages.flatMap((p) =>
  p.legacy.map((from) => ({
    source: from,
    destination: p.slug,
    permanent: true,
  }))
);

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray lockfile in the home dir otherwise
  // makes Next infer the wrong root.
  turbopack: { root: __dirname },
  async redirects() {
    return [
      ...legacyRedirects,
      // Old PHP endpoints that used to render pages.
      { source: "/AnualEvents.php", destination: "/activities", permanent: true },
      { source: "/gallery.php", destination: "/gallery", permanent: true },
      { source: "/news.php", destination: "/notices", permanent: true },
      // PDF Redirects to Firebase Storage
      {
        source: "/Documents/:file*",
        destination: "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/Documents/:file*",
        permanent: true,
      },
      {
        source: "/uploads/notice/:file*",
        destination: "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/uploads/notice/:file*",
        permanent: true,
      },
      {
        source: "/:file.pdf",
        destination: "https://storage.googleapis.com/the-elisabeth-gauba-scho-534b5.firebasestorage.app/:file.pdf",
        permanent: true,
      },
    ];
  },
  images: {
    // Ported content uses plain <img> to legacy asset paths and the
    // Firebase Storage bucket; don't run them through the optimizer.
    unoptimized: true,
  },
};

export default nextConfig;
