import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OwlInit from "@/components/OwlInit";
import { site } from "@/lib/site";
import { organizationJsonLd } from "@/lib/seo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  icons: {
    icon: "/images/school-logo.jpg",
    shortcut: "/images/school-logo.jpg",
    apple: "/images/school-logo.jpg",
  },
  robots: { index: true, follow: true },
};

/**
 * The legacy stylesheets, in the exact order the original site loaded them.
 * Served straight from /public/css so the design renders identically.
 */
const LEGACY_CSS = [
  "/css/bootstrap.min.css",
  "/css/font-awesome.css",
  "/css/owl.theme.css",
  "/css/style.css",
  "/css/ChooseUs.css",
  "/css/simpleLightbox.css",
  "/css/owl.carousel.css",
  "/css/MainMenu.css",
  "/css/News.css",
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/jpeg" href="/images/school-logo.jpg" />
        <link rel="shortcut icon" href="/images/school-logo.jpg" />
        <link
          href="https://fonts.googleapis.com/css?family=Roboto+Condensed:300,300i,400,400i,700,700i"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Lato:100,100i,300,300i,400,400i,700,700i,900,900i"
          rel="stylesheet"
        />
        {/* Original stylesheets — keep the site's look identical to the legacy build */}
        {LEGACY_CSS.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        <script
          type="application/ld+json"
          // Structured data for education/local search.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
      </head>
      <body>
        {/* jQuery + the legacy responsive-menu plugin, loaded before the app
            so the mobile nav collapses exactly like the original. Desktop
            dropdowns are pure CSS and need no JS. */}
        <Script src="/js/jquery-2.1.4.min.js" strategy="beforeInteractive" />
        <Script src="/js/jquery.MainMenu.js" strategy="beforeInteractive" />
        <Script id="mainmenu-init" strategy="afterInteractive">
          {`if (window.jQuery) { try { jQuery('header nav').MainMenu({ MainScreenWidth: "991" }); } catch (e) {} }`}
        </Script>

        {/* GA4 — only loads when a real measurement id is configured */}
        {site.ga4Id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${site.ga4Id}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${site.ga4Id}');`}
            </Script>
          </>
        )}

        {/* Auto-sliding Owl Carousel galleries (legacy v1.3.3) */}
        <OwlInit />

        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
