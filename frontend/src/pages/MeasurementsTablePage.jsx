import React, { useEffect, useState, useCallback } from "react";
import apiService from "../services/api";
import Topbar from "../components/Topbar";
import "../styles/dashboard.css";

function MeasurementsTablePage() {
  const [measurements, setMeasurements] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Фільтри
  const [selectedStation, setSelectedStation] = useState("all");
  const [selectedPollutant, setSelectedPollutant] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Сортування
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first

  // Пагінація
  const [page, setPage] = useState(1);
  const limit = 100;

  // Завантажити список станцій (для фільтра)
  useEffect(() => {
    apiService.getStations({ limit: 10000 }).then((data) => setStations(data));
  }, []);

  // Функція завантаження вимірювань
  const loadMeasurements = useCallback(async () => {
    setLoading(true);

    const params = {
      page,
      limit,
      station_id: selectedStation !== "all" ? selectedStation : undefined,
      pollutant: selectedPollutant !== "all" ? selectedPollutant : undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    };

    const data = await apiService.getMeasurements(params);

    // локальне сортування за датою
    const sorted = [...data].sort((a, b) => {
      const t1 = new Date(a.measurement_time).getTime();
      const t2 = new Date(b.measurement_time).getTime();
      return sortOrder === "desc" ? t2 - t1 : t1 - t2;
    });

    setMeasurements(sorted);
    setLoading(false);
  }, [selectedStation, selectedPollutant, startDate, endDate, sortOrder, page]);

  useEffect(() => {
    loadMeasurements();
  }, [loadMeasurements]);

  return (
    <div>
      <Topbar />

      <div className="dashboard-container">
        <h2>Таблиця вимірювань</h2>

        {/* Панель фільтрів */}
        <div className="filters-panel">
          {/* Фільтр станцій */}
          <select
            className="filter-select"
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
          >
            <option value="all">Всі станції</option>

            {stations
                .sort((a, b) => {
                // Спочатку сортуємо за містом, потім за назвою станції
                if (a.city_name.toLowerCase() < b.city_name.toLowerCase()) return -1;
                if (a.city_name.toLowerCase() > b.city_name.toLowerCase()) return 1;

                return a.station_name.localeCompare(b.station_name);
            })
            .map((s) => (
                <option key={s.station_id} value={s.station_id}>
                    {s.city_name} — {s.station_name}
                </option>
            ))}
          </select>


          {/* Фільтр забруднювача */}
          <select
            className="filter-select"
            value={selectedPollutant}
            onChange={(e) => setSelectedPollutant(e.target.value)}
          >
            <option value="all">Всі забруднювачі</option>

            <option value="PM2.5">PM2.5</option>
            <option value="PM10">PM10</option>

            {/* Параметри погоди */}
            <option value="Temperature">Температура</option>
            <option value="Humidity">Вологість</option>
            <option value="Pressure">Тиск</option>

            {/* Газові забруднювачі */}
            <option value="NO2">NO₂</option>
            <option value="SO2">SO₂</option>
            <option value="CO">CO</option>
            <option value="O3">O₃</option>

            <option value="Air Quality Index">AQI</option>
          </select>

          {/* Дата від */}
          <input
            type="date"
            className="filter-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          {/* Дата до */}
          <input
            type="date"
            className="filter-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          {/* Сортування */}
          <select
            className="filter-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="desc">Нові зверху</option>
            <option value="asc">Старі зверху</option>
          </select>
        </div>

        {/* Таблиця */}
        {loading ? (
          <p>Завантаження...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Станція</th>
                <th>Час</th>
                <th>Забруднювачі</th>
                <th>Джерело</th>
              </tr>
            </thead>

            <tbody>
              {measurements.map((m, i) => (
                <tr key={i}>
                  <td>{m.station_id}</td>
                  <td>{new Date(m.measurement_time).toLocaleString("uk-UA")}</td>
                  <td>
                    {selectedPollutant === "all"
                        ? m.pollutants.map((p, idx) => (
                            <div key={idx}>
                                {p.pollutant}: {p.value} {p.unit}
                            </div>
                        )) : (() => {
                            const pol = m.pollutants.find(
                                (p) => p.pollutant === selectedPollutant
                            );
                            return pol ? (
                                <div>
                                    {pol.pollutant}: {pol.value} {pol.unit}
                                </div>
                            ) : (
                                <div style={{ opacity: 0.5 }}>—</div>
                            );
                        })()}
                    </td>
                  <td>{m.metadata?.source || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Пагінація */}
        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
          <button
            className="topbar-sync-btn"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Назад
          </button>

          <button
            className="topbar-sync-btn"
            onClick={() => setPage(page + 1)}
          >
            Вперед →
          </button>
        </div>
      </div>
    </div>
  );
}

export default MeasurementsTablePage;
