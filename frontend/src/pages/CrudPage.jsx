import React, { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import apiService from "../services/api";
import "../styles/dashboard.css";

function CrudDemoPage() {
  const [action, setAction] = useState("read");

  const [form, setForm] = useState({
    station_id: "",
    city_name: "",
    station_name: "",
    platform_name: "demo",
    location: { type: "Point", coordinates: [0, 0] }
  });

  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState("");

  // LOAD ALL STATIONS
  const loadStations = async () => {
    const data = await apiService.getStations({ limit: 10000 });
    setStations(data);
  };

  useEffect(() => {
    loadStations();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // AUTOLOAD STATION INTO FORM WHEN SELECTED
  const handleStationSelect = async (id) => {
    setSelectedStationId(id);
    const station = stations.find((s) => s.station_id === id);
    if (station) {
      setForm({
        station_id: station.station_id,
        city_name: station.city_name,
        station_name: station.station_name,
        platform_name: station.platform_name,
        location: station.location
      });
    }
  };

  // CREATE
  const createStation = async () => {
    await apiService.createStation(form);
    alert("Створено!");
    loadStations();
  };

  // UPDATE
  const updateStation = async () => {
    await apiService.updateStation(form.station_id, form);
    alert("Оновлено!");
    loadStations();
  };

  // DELETE
  const deleteStation = async () => {
    await apiService.deleteStation(selectedStationId);
    alert("Видалено!");
    loadStations();
  };

  return (
    <div className="dashboard-container">
    <Topbar/>
      <div className="crud-wrapper">

        <div className="crud-title">CRUD Операції над станціями</div>

        {/* SELECT ACTION */}
        <select
          className="crud-select"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setForm({
              station_id: "",
              city_name: "",
              station_name: "",
              platform_name: "demo",
              location: { type: "Point", coordinates: [0, 0] }
            });
            setSelectedStationId("");
          }}
        >
          <option value="create">Створити</option>
          <option value="read">Переглянути</option>
          <option value="update">Оновити</option>
          <option value="delete">Видалити</option>
        </select>

        {/* CREATE FORM */}
        {action === "create" && (
          <div className="crud-form">

            <input
              className="crud-input"
              name="station_id"
              placeholder="ID станції"
              value={form.station_id}
              onChange={handleChange}
            />

            <input
              className="crud-input"
              name="city_name"
              placeholder="Місто"
              value={form.city_name}
              onChange={handleChange}
            />

            <input
              className="crud-input"
              name="station_name"
              placeholder="Назва станції"
              value={form.station_name}
              onChange={handleChange}
            />

            <button className="crud-btn create" onClick={createStation}>
              Створити
            </button>
          </div>
        )}

        {/* UPDATE FORM */}
        {action === "update" && (
          <div className="crud-form">

            {/* SELECT STATION TO UPDATE */}
            <select
              className="crud-select"
              value={selectedStationId}
              onChange={(e) => handleStationSelect(e.target.value)}
            >
              <option value="">-- Обрати станцію --</option>
              {stations.map((s) => (
                <option key={s.station_id} value={s.station_id}>
                  {s.station_id} — {s.city_name}, {s.station_name}
                </option>
              ))}
            </select>

            {selectedStationId && (
              <>
                <input
                  className="crud-input"
                  name="city_name"
                  placeholder="Місто"
                  value={form.city_name}
                  onChange={handleChange}
                />

                <input
                  className="crud-input"
                  name="station_name"
                  placeholder="Назва станції"
                  value={form.station_name}
                  onChange={handleChange}
                />

                <button className="crud-btn update" onClick={updateStation}>
                  Оновити
                </button>
              </>
            )}
          </div>
        )}

        {/* DELETE FORM */}
        {action === "delete" && (
          <div className="crud-form">

            {/* SELECT STATION FOR DELETE */}
            <select
              className="crud-select"
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
            >
              <option value="">-- Обрати станцію --</option>
              {stations.map((s) => (
                <option key={s.station_id} value={s.station_id}>
                  {s.station_id} — {s.city_name}, {s.station_name}
                </option>
              ))}
            </select>

            <button className="crud-btn delete" onClick={deleteStation}>
              Видалити
            </button>
          </div>
        )}

        {/* READ TABLE */}
        {action === "read" && (
          <table className="crud-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Місто</th>
                <th>Назва</th>
              </tr>
            </thead>

            <tbody>
              {stations.length === 0 ? (
                <tr>
                  <td colSpan="3" className="crud-empty">
                    Немає даних
                  </td>
                </tr>
              ) : (
                stations.map((s) => (
                  <tr key={s.station_id}>
                    <td>{s.station_id}</td>
                    <td>{s.city_name}</td>
                    <td>{s.station_name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CrudDemoPage;
