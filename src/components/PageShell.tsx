import type { ReactNode } from "react";

/**
 * Standard content-page wrapper, styled to match the legacy site: the blue
 * `Main_header` title with its orange underline, inside the same
 * `content-wrapper` / `container` structure the original pages used. The
 * legacy stylesheets (loaded globally) render it identically to the live site.
 */
export default function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div id="body">
      <section className="content-wrapper main-content clear-fix">
        <div className="popular-section-wthree">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="wthree-heading">
                  <h1 className="Main_header">{title}</h1>
                </div>
              </div>
            </div>
            {intro && <p className="Main_header three">{intro}</p>}
            {children}
            <div className="clearfix"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
