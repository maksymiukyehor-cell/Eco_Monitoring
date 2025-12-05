import React from "react";
import MeasurementItem from "./MeasurementItem";

function MeasurementsFeed({ measurements }) {
  return (
    <div className="measurements-box">
      <div className="measurements-header">Останні вимірювання</div>

      <div className="measurements-list">
        {measurements.map((m, index) => (
          <MeasurementItem key={index} m={m} />
        ))}
      </div>
    </div>
  );
}

export default MeasurementsFeed;
