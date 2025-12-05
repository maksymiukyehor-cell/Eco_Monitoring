import React from "react";
import StationCard from "./StationCard";

function StationsGrid({ stations }) {
  return (
    <div className="station-grid">
      {stations.map((s, index) => (
        <StationCard key={index} station={s} />
      ))}
    </div>
  );
}

export default StationsGrid;
