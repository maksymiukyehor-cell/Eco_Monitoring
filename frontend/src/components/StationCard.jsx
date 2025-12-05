import React from "react";

function StationCard({ station }) {
  const lat = station.location?.coordinates?.[1]?.toFixed(4);
  const lon = station.location?.coordinates?.[0]?.toFixed(4);

  return (
    <div className="station-card">
      <div className="station-header">
        <div className="station-title">{station.station_name}</div>

        <span className={`station-status ${station.status}`}>
          {station.status}
        </span>
      </div>

      <div className="station-meta">{station.city_name}</div>

      <div className="station-meta">
        ID: <code>{station.station_id}</code>
      </div>

      <div className="station-meta">
        Останнє вимірювання:{" "}
        {station.metadata?.last_measurement
          ? new Date(station.metadata.last_measurement).toLocaleString("uk-UA")
          : "немає даних"}
      </div>

      <div className="station-coords">
        {lat}, {lon}
      </div>
    </div>
  );
}

export default StationCard;
