"use client";

import { useEffect } from "react";

/**
 * Initialises the legacy Owl Carousel (v1.3.3) sliders.
 *
 * Several ported pages (facilities, co-curricular, founder, school-history,
 * safety-security, setu-project, staff) contain `.owl-carousel` image galleries
 * that, on the original site, auto-slide via `$('.owl-carousel').owlCarousel(...)`.
 * The markup was carried over verbatim, but the init `<script>` was dropped, so
 * the images just stacked. This runs the exact same init against the exact same
 * owl.carousel.js so they slide identically to the live site.
 *
 * Navigation between pages is full-page (plain <a>), so this mounts fresh per
 * page and the init runs once per load — no double-init handling needed.
 */
export default function OwlInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Nothing to do on pages without a carousel.
    if (!document.querySelector(".owl-carousel")) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;

    function init() {
      const $ = w.jQuery;
      if (!$ || !$.fn || !$.fn.owlCarousel) return;

      // margin was 1 on Curricular (co-curricular) & Security (safety-security),
      // 10 on every other page — reproduced verbatim from the legacy pages.
      const path = window.location.pathname;
      const margin =
        path.indexOf("co-curricular") !== -1 ||
        path.indexOf("safety-security") !== -1
          ? 1
          : 10;

      $(".owl-carousel").owlCarousel({
        margin: margin,
        loop: true,
        autoWidth: true,
        items: 1,
        autoPlay: true,
        autoplayTimeout: 1000,
        autoplayHoverPause: true,
      });
    }

    // jQuery is loaded beforeInteractive; the owl plugin may not be present yet.
    if (w.jQuery && w.jQuery.fn && w.jQuery.fn.owlCarousel) {
      init();
      return;
    }

    // Load the legacy owl plugin once, then init.
    const ID = "owl-carousel-js";
    const existing = document.getElementById(ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", init);
      return;
    }
    const s = document.createElement("script");
    s.id = ID;
    s.src = "/js/owl.carousel.js";
    s.onload = init;
    document.body.appendChild(s);
  }, []);

  return null;
}
