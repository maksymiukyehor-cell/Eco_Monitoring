import React from "react";

function MeasurementItem({ m }) {
  return (
    <div className="measurement-item">
      <div className="measurement-left">
        <span className="measurement-station">{m.station_id}</span>
        <span className="measurement-time">
          {new Date(m.measurement_time).toLocaleString("uk-UA")}
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {m.pollutants?.map((p, idx) => (
          <span key={idx} className="pollutant-badge">
            {p.pollutant}: {p.value} {p.unit}
          </span>
        ))}
      </div>
    </div>
  );
}

export default MeasurementItem;
