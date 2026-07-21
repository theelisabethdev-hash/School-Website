"use client";

import { SchoolTiming } from "@/lib/api";

type Props = {
  timing: SchoolTiming;
};

export default function SchoolTimingClient({ timing }: Props) {
  return (
    <div className="school-timing-container">
      <style dangerouslySetInnerHTML={{ __html: `
        /* ---- School Timing Page Styles ---- */
        .school-timing-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px 60px;
          font-family: 'Lato', 'Roboto', sans-serif;
          color: #2d3748;
        }

        /* Main Schedule Banner */
        .st-schedule-banner {
          background: linear-gradient(135deg, #214AB3 0%, #1a3a8f 100%);
          color: white;
          border-radius: 16px;
          padding: 32px 36px;
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 36px;
          box-shadow: 0 8px 30px rgba(33, 74, 179, 0.3);
          animation: stSlideUp 0.7s ease-out 0.1s both;
        }

        .st-schedule-icon {
          width: 64px;
          height: 64px;
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 28px;
        }

        .st-schedule-text h2 {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          opacity: 0.75;
          margin: 0 0 8px;
        }

        .st-schedule-text p {
          font-size: 22px;
          font-weight: 700;
          margin: 0;
          line-height: 1.3;
        }

        /* Info Cards Grid */
        .st-cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 32px;
          animation: stSlideUp 0.7s ease-out 0.2s both;
        }

        .st-card {
          background: #fff;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.05);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .st-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.1);
        }

        .st-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          background: #eef2ff;
          color: #214AB3;
        }

        .st-card-body h3 {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #000;
          margin: 0 0 6px;
        }

        .st-card-body p {
          font-size: 15px;
          color: #2d3748;
          margin: 0;
          line-height: 1.6;
        }

        /* Notes Section */
        .st-notes {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 14px;
          padding: 28px 32px;
          animation: stSlideUp 0.7s ease-out 0.3s both;
        }

        .st-notes-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .st-notes-header h2 {
          font-size: 18px;
          font-weight: 700;
          color: #92400e;
          margin: 0;
        }

        .st-notes-header .note-icon {
          font-size: 20px;
          color: #f59e0b;
        }

        .st-notes ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .st-notes li {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          font-size: 15px;
          color: #78350f;
          line-height: 1.6;
        }

        .st-notes li::before {
          content: '→';
          color: #f59e0b;
          font-weight: bold;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* Animations */
        @keyframes stFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes stSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .st-hero h1 { font-size: 30px; }
          .st-schedule-banner { flex-direction: column; text-align: center; padding: 24px; }
          .st-schedule-text p { font-size: 18px; }
          .st-notes { padding: 20px; }
        }
      `}} />


      {/* Main Schedule Banner */}
      <div className="st-schedule-banner">
        <div className="st-schedule-icon">
          <i className="fa fa-clock-o" aria-hidden="true"></i>
        </div>
        <div className="st-schedule-text">
          <h1>Regular School Hours</h1>
          <p>{timing.mainSchedule}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="st-cards-grid">
        <div className="st-card">
          <div className="st-card-icon">
            <i className="fa fa-building-o" aria-hidden="true"></i>
          </div>
          <div className="st-card-body">
            <h3>Office Hours</h3>
            <p>{timing.officeHours}</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="st-notes">
        <div className="st-notes-header">
          <span className="note-icon"><i className="fa fa-exclamation-circle" aria-hidden="true"></i></span>
          <h2>Important Notes</h2>
        </div>
        <ul>
          {timing.noteSession && <li>{timing.noteSession}</li>}
          {timing.noteDussehra && <li>{timing.noteDussehra}</li>}
          {timing.noteFee && <li>{timing.noteFee}</li>}
        </ul>
      </div>
    </div>
  );
}
