import React, { useState, useEffect, useCallback } from "react";
import apiService from "../services/api";
import Topbar from "../components/Topbar";
import "../styles/dashboard.css";

function StationsTablePage() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [nameFilter, setNameFilter] = useState("");

  const [sortField, setSortField] = useState("city_name");
  const [sortOrder, setSortOrder] = useState("asc");

  const [cities, setCities] = useState([]);

  const loadStations = useCallback(async () => {
    setLoading(true);

    const params = {
      city: cityFilter || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      limit: 500,
    };

    const data = await apiService.getStations(params);

    const uniqueCities = [...new Set(data.map((s) => s.city_name))].sort();
    setCities(uniqueCities);

    const sorted = [...data].sort((a, b) => {
      let x = a[sortField];
      let y = b[sortField];

      if (sortField === "updated_at" || sortField === "metadata") {
        x = new Date(a?.metadata?.updated_at || 0).getTime();
        y = new Date(b?.metadata?.updated_at || 0).getTime();
      }

      if (typeof x === "string") x = x.toLowerCase();
      if (typeof y === "string") y = y.toLowerCase();

      return sortOrder === "asc" ? (x > y ? 1 : -1) : (x < y ? 1 : -1);
    });

    const filteredByName = sorted.filter((s) =>
      s.station_name.toLowerCase().includes(nameFilter.toLowerCase())
    );

    setStations(filteredByName);
    setLoading(false);
  }, [cityFilter, statusFilter, nameFilter, sortField, sortOrder]);

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  return (
    <div>
      <Topbar />

      <div className="dashboard-container">
        <h2>Таблиця станцій</h2>

        {/* Панель фільтрів */}
        <div className="filters-panel">

          {/* Дропбокс міст */}
          <select
            className="filter-select"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="">Всі міста</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          {/* Фільтр статусу */}
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Всі статуси</option>
            <option value="active">Активні</option>
            <option value="inactive">Неактивні</option>
            <option value="maintenance">Обслуговування</option>
          </select>

          {/* Пошук за назвою станції */}
          <input
            className="filter-input"
            placeholder="Пошук за станцією"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />

          {/* Сортування */}
          <select
            className="filter-select"
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="city_name">Місто</option>
            <option value="station_name">Назва станції</option>
            <option value="metadata">Останнє оновлення</option>
          </select>

          <select
            className="filter-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">За зростанням</option>
            <option value="desc">За спаданням</option>
          </select>
        </div>

        {/* Таблиця станцій */}
        {loading ? (
          <p>Завантаження...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Місто</th>
                <th>Назва</th>
                <th>Платформа</th>
                <th>Статус</th>
                <th>Оновлено</th>
              </tr>
            </thead>

            <tbody>
              {stations.map((s) => (
                <tr key={s.station_id}>
                  <td>{s.station_id}</td>
                  <td>{s.city_name}</td>
                  <td>{s.station_name}</td>
                  <td>{s.platform_name}</td>
                  <td>{s.status || "unknown"}</td>
                  <td>
                    {s.metadata?.updated_at
                      ? new Date(s.metadata.updated_at).toLocaleString("uk-UA")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default StationsTablePage;
