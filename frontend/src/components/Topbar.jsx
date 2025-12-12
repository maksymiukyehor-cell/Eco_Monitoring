import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiService from "../services/api";
import "../styles/dashboard.css";

function Topbar({ onSync, syncing }) {
  const [healthStatus, setHealthStatus] = useState("checking");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await apiService.getHealth();
        if (res.success && res.status === "healthy") {
          setHealthStatus("healthy");
        } else {
          setHealthStatus("unhealthy");
        }
      } catch (e) {
        setHealthStatus("unhealthy");
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Link to="/" className="topbar-title">
          EcoMonitor
        </Link>

        <Link to="/stations" className="nav-btn">
          Станції
        </Link>

        <Link to="/measurements" className="nav-btn">
          Вимірювання
        </Link>

        <Link to="/crud" className="nav-btn">
          CRUD
        </Link>

        <Link to="/airindex" className="nav-btn">
          Air Index
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          className={`topbar-status ${
            healthStatus === "healthy" ? "online" : "offline"
          }`}
        >
          {" "}
          {healthStatus === "checking"
            ? "Перевірка..."
            : healthStatus === "healthy"
            ? "Online"
            : "Offline"}
        </span>

        {onSync && (
          <button
            className="topbar-sync-btn"
            onClick={onSync}
            disabled={syncing}
          >
            {syncing ? "Синхронізація..." : "⟳ Sync"}
          </button>
        )}
      </div>
    </div>
  );
}

export default Topbar;
