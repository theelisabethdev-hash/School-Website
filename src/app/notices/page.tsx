import { pageMetadata } from "@/lib/seo";
import { getNews } from "@/lib/api";
import NoticesAccordion from "@/components/NoticesAccordion";

export const metadata = pageMetadata("/notices");
export const revalidate = 0;

export default async function NoticesPage() {
  const notices = await getNews();

  return (
    <div id="body">
      <section className="content-wrapper main-content clear-fix">
        <div className="popular-section-wthree">
          <div className="container">

            {/* ── Page heading ── */}
            <div className="row">
              <div className="col-md-12">
                <div className="wthree-heading">
                  <h2 className="Main_header">Notices &amp; News</h2>
                </div>
              </div>
            </div>



            {/* ── Content ── */}
            {notices.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#94a3b8",
                fontFamily: "'Inter','Segoe UI',sans-serif",
              }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔔</div>
                <p style={{ fontSize: "16px", margin: 0 }}>
                  No notices at the moment. Please check back soon.
                </p>
              </div>
            ) : (
              <NoticesAccordion notices={notices} />
            )}

            <div className="clearfix" />
          </div>
        </div>
      </section>
    </div>
  );
}
