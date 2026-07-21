import { pageMetadata } from "@/lib/seo";
import { getAcademicCalendar } from "@/lib/api";

export const metadata = pageMetadata("/academic-calendar");
export const dynamic = "force-dynamic";

export default async function Page() {
  const calendar = await getAcademicCalendar();

  const calendarUrl = calendar?.pdfUrl || "/Documents/Planner-24-25-Students.pdf";
  const calendarName = calendar?.fileName || "School Calender 2024-2025";

  return (
    <div id="body">
      <div className="popular-section-wthree">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h1 className="Main_header">Academic Calendar</h1>
              <br />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">&nbsp;</div>
          </div>

          <div className="row">
            <div className="col-md-3"></div>
            <div className="col-md-5">
              <table>
                <tbody>
                  <tr>
                    <td className="table-column">{calendarName}</td>
                    <td className="table-column">
                      <a target="_blank" rel="noopener noreferrer" href={calendarUrl}>
                        Download
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-md-4"></div>
          </div>
          
          <div className="row"><div className="col-md-12">&nbsp;</div></div>
          <div className="row"><div className="col-md-12">&nbsp;</div></div>
          <div className="row"><div className="col-md-12">&nbsp;</div></div>
          <div className="row"><div className="col-md-12">&nbsp;</div></div>
          <div className="row"><div className="col-md-12">&nbsp;</div></div>
          <div className="row"><div className="col-md-12">&nbsp;</div></div>
          <div className="clearfix"></div>
        </div>
      </div>
    </div>
  );
}
