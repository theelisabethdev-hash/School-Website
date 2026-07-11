import PageShell from "@/components/PageShell";
import { pageMetadata } from "@/lib/seo";
import { getVacancies } from "@/lib/api";

export const metadata = pageMetadata("/vacancies");
export const revalidate = 0;

export default async function VacanciesPage() {
  const vacancies = await getVacancies();

  return (
    <PageShell title="Vacancy (2026-27)">
      <p style={{ marginBottom: "20px", fontSize: "15px", lineHeight: "1.6" }}>
        Committed, dynamic, qualified and experienced individuals with excellent communication skills are required for the following positions:
      </p>
      
      {vacancies.length === 0 ? (
        <div style={{ padding: "30px 15px", border: "1px dashed #ccc", borderRadius: "4px", color: "#666", marginBottom: "20px" }}>
          <p>There are currently no active job vacancies. Please check back later or email your CV to us directly.</p>
        </div>
      ) : (
        <div className="row">
          <div className="col-md-12">
            <div className="bs-docs-example" style={{ overflowX: "auto" }}>
              <table className="table-hover" border={1} style={{ borderColor: "#759194", width: "100%", marginBottom: "20px" }}>
                <thead>
                  <tr className="table-header" style={{ backgroundColor: "lightgray" }}>
                    <th className="Vacanciestablepadding" style={{ padding: "10px" }}>Post</th>
                    <th className="Vacanciestablepadding" style={{ padding: "10px" }}>Qualifications Details</th>
                    <th className="Vacanciestablepadding" style={{ padding: "10px", width: "150px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vacancies.map((v) => (
                    <tr key={v.id}>
                      <td className="Vacanciestablepadding" style={{ padding: "10px", fontWeight: "bold", verticalAlign: "top" }}>
                        {v.post}
                      </td>
                      <td 
                        className="Vacanciestablepadding" 
                        style={{ padding: "10px", whiteSpace: "pre-line", verticalAlign: "top" }}
                      >
                        {v.qualification}
                      </td>
                      <td className="Vacanciestablepadding" style={{ padding: "10px", verticalAlign: "top" }}>
                        <b>Status: </b>{v.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      <div className="row" style={{ marginTop: "20px" }}>
        <div className="col-md-12">
          <p style={{ fontWeight: "bold", fontSize: "14px" }}>
            Those interested, please email your CV to: <a href="mailto:theelisabethgaubaschool@gmail.com">theelisabethgaubaschool@gmail.com</a> or Contact phone nos.: 8800541280, 8800541980
          </p>
        </div>
      </div>
    </PageShell>
  );
}
