import {
  Search,
  CheckCircle,
  Clock,
  MapPin,
  FileText,
} from "lucide-react";

import { useState } from "react";


function TrackReport() {

  const [reportId, setReportId] = useState("");

  const [report, setReport] = useState(null);


  const searchReport = (e) => {

    e.preventDefault();

    if (!reportId.trim()) {
      return;
    }


    // Temporary data
    setReport({
      id: reportId.toUpperCase(),

      type: "Garbage Pollution",

      location: "Mwanakwerekwe",

      date: "01 September 2026",

      status: "Under Review",
    });

  };


  return (

    <main className="track-page">

      <section className="track-header">

        <div className="section-label">
          REPORT TRACKING
        </div>

        <h1>
          Track Your Report
        </h1>

        <p>
          Enter your Report ID to see the current
          progress of your report.
        </p>

      </section>


      <section className="track-search-card">

        <form onSubmit={searchReport}>

          <label>
            Report ID
          </label>

          <div className="track-input">

            <FileText size={20} />

            <input
              type="text"
              placeholder="Example: REP-2026-001"
              value={reportId}
              onChange={(e) =>
                setReportId(e.target.value)
              }
            />

          </div>

          <button type="submit">
            <Search size={18} />
            Track Report
          </button>

        </form>

      </section>


      {report && (

        <section className="report-result">

          <div className="report-result-header">

            <div>

              <span>
                REPORT ID
              </span>

              <h2>
                {report.id}
              </h2>

            </div>

            <div className="tracking-status">
              {report.status}
            </div>

          </div>


          <div className="report-details">

            <div>
              <span>Problem</span>
              <strong>{report.type}</strong>
            </div>

            <div>
              <span>Location</span>
              <strong>
                <MapPin size={16} />
                {report.location}
              </strong>
            </div>

            <div>
              <span>Date Reported</span>
              <strong>{report.date}</strong>
            </div>

          </div>


          <div className="tracking-timeline">

            <div className="timeline-step completed">

              <div className="timeline-icon">
                <CheckCircle size={19} />
              </div>

              <div>
                <strong>
                  Report Sent
                </strong>

                <span>
                  Your report was successfully submitted.
                </span>
              </div>

            </div>


            <div className="timeline-line"></div>


            <div className="timeline-step completed">

              <div className="timeline-icon">
                <CheckCircle size={19} />
              </div>

              <div>
                <strong>
                  Report Received
                </strong>

                <span>
                  The municipal system received your report.
                </span>
              </div>

            </div>


            <div className="timeline-line"></div>


            <div className="timeline-step current">

              <div className="timeline-icon">
                <Clock size={19} />
              </div>

              <div>
                <strong>
                  Under Review
                </strong>

                <span>
                  Municipal officers are reviewing the incident.
                </span>
              </div>

            </div>


            <div className="timeline-line"></div>


            <div className="timeline-step">

              <div className="timeline-icon">
                <CheckCircle size={19} />
              </div>

              <div>
                <strong>
                  Resolved
                </strong>

                <span>
                  This stage will be completed after action is taken.
                </span>
              </div>

            </div>

          </div>

        </section>

      )}

    </main>
  );
}

export default TrackReport;
