import React, { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import SummaryCards from "../components/SummaryCards";
import StationsGrid from "../components/StationGrid";
import MeasurementsFeed from "../components/MeasurementFeed";
import apiService from "../services/api";
import "../styles/dashboard.css";

function Dashboard() {
  const [stations, setStations] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [healthStatus, setHealthStatus] = useState("checking");
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [stRes, msRes, healthRes] = await Promise.all([
        apiService.getStations(),
        apiService.getLatestMeasurements(),
        apiService.getHealth(),
      ]);

      setStations(stRes || []);
      setMeasurements(msRes || []);
      setHealthStatus(healthRes.success ? "healthy" : "unhealthy");
    } catch (error) {
      setHealthStatus("unhealthy");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiService.syncSaveEcoBot();
      setLastSync(new Date().toLocaleString("uk-UA"));
      await loadAll();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <Topbar
        syncing={syncing}
        onSync={handleSync}
      />

      <div className="dashboard-container">
        <SummaryCards
          totalStations={stations.length}
          activeStations={stations.filter((s) => s.status === "active").length}
          lastSync={lastSync}
        />

        <h2 style={{ marginBottom: "12px" }}>Станції моніторингу</h2>
        <StationsGrid stations={stations} />

        <MeasurementsFeed measurements={measurements} />
      </div>
    </div>
  );
}

export default Dashboard;
