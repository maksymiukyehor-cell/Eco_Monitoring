import React from "react";

function SummaryCards({ totalStations, activeStations, lastSync }) {
  return (
    <div className="summary-grid">

      <div className="summary-card">
        <div className="summary-label">Всього станцій</div>
        <div className="summary-value">{totalStations}</div>
      </div>

      <div className="summary-card">
        <div className="summary-label">Активних станцій</div>
        <div className="summary-value">{activeStations}</div>
      </div>

      <div className="summary-card">
        <div className="summary-label">Остання синхронізація</div>
        <div className="summary-value">{lastSync || "—"}</div>
      </div>

    </div>
  );
}

export default SummaryCards;
