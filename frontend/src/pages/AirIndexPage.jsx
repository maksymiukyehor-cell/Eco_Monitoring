import React, { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import apiService from "../services/api";
import "../styles/dashboard.css";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LIMITS = {
  "PM2.5": { min: 5, max: 150 },
  "PM10": { min: 10, max: 300 },
  "NO2": { min: 10, max: 400 },
  "SO2": { min: 5, max: 200 },
  "O3": { min: 10, max: 250 }
};

function AirIndexPage() {
  const [stations, setStations] = useState([]);
  const [stationId, setStationId] = useState("");

  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiService.getStations().then((data) => {
      setStations(data);
    });
  }, []);

  const updateField = (pol, value) => {
    setInputs({ ...inputs, [pol]: value });
  };

  const generateData = () => {
    const synthetic = {};

    Object.keys(LIMITS).forEach((pol) => {
      synthetic[pol] =
        Math.round(
          (Math.random() * (LIMITS[pol].max - LIMITS[pol].min) +
            LIMITS[pol].min) *
            10
        ) / 10;
    });

    setInputs(synthetic);
    toast.info("Синтетичні дані згенеровано");
  };

  const calculate = async () => {
    if (!stationId) {
      toast.warning("Оберіть станцію");
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.calculateAirIndex({
        station_id: stationId,
        manual: inputs
      });

      if (!response.success) {
        toast.error("Помилка розрахунку");
      } else {
        setResult(response.data);
        toast.success("Розрахунок виконано");
      }
    } catch (e) {
      toast.error("Помилка сервера");
    }

    setLoading(false);
  };

  const markerPosition = result ? Math.min(result.I, 200) / 2 : 0;

  return (
    <div>
      <Topbar />

      <div className="dashboard-container">
        <h2>Розрахунок індексу якості повітря</h2>

        <select
          className="filter-select"
          value={stationId}
          onChange={(e) => setStationId(e.target.value)}
        >
          <option value="">Оберіть станцію...</option>
          {stations.map((s) => (
            <option key={s.station_id} value={s.station_id}>
              {s.city_name} — {s.station_name}
            </option>
          ))}
        </select>

        <h3 style={{ marginTop: "20px" }}>Вхідні параметри (опціонально)</h3>

        <div className="filters-panel" style={{ flexWrap: "wrap" }}>
          {Object.keys(LIMITS).map((pol) => (
            <div key={pol} style={{ display: "flex", flexDirection: "column" }}>
              <label>{pol}</label>
              <input
                className="filter-input"
                type="number"
                placeholder={`(${LIMITS[pol].min}-${LIMITS[pol].max})`}
                value={inputs[pol] ?? ""}
                onChange={(e) => updateField(pol, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
          <button className="topbar-sync-btn" onClick={generateData}>
            Згенерувати дані
          </button>

          <button className="topbar-sync-btn" onClick={calculate} disabled={loading}>
            {loading ? "Обчислення..." : "Розрахувати індекс"}
          </button>
        </div>

        {result && (
          <>
            <div className="summary-card" style={{ marginTop: "20px" }}>
              <h3>Результат</h3>

              <p>
                <b>Індекс:</b> {result.I}
              </p>

              <p>
                <b>Рівень:</b>{" "}
                <span
                  style={{
                    color:
                      result.level === "good"
                        ? "green"
                        : result.level === "moderate"
                        ? "orange"
                        : result.level === "bad"
                        ? "red"
                        : "darkred",
                    fontWeight: "bold"
                  }}
                >
                  {result.level}
                </span>
              </p>

              <h4>Деталізація:</h4>
              <ul>
                {Object.entries(result.subIndices).map(([k, v]) => (
                  <li key={k}>
                    {k}: {v.value} / {v.limit} - субіндекс {v.subindex}
                  </li>
                ))}
              </ul>
            </div>
            
            <div
              style={{
                marginTop: "25px",
                height: "18px",
                borderRadius: "10px",
                background:
                  "linear-gradient(to right, green, yellow, orange, red, darkred)",
                position: "relative"
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-6px",
                  left: `${markerPosition}%`,
                  width: "12px",
                  height: "12px",
                  background: "black",
                  borderRadius: "50%"
                }}
              ></div>
            </div>
            <p style={{ fontSize: "13px", color: "#777" }}>
              (0 - 200), значення "I"
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default AirIndexPage;
