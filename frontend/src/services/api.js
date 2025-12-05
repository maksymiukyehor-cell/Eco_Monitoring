import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const API_ROOT = process.env.REACT_APP_ROOT_URL || "http://localhost:3000";


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// ==============================
// STATIONS
// ==============================

export const apiService = {
  getStations: async (params = {}) => {
    const response = await api.get('/stations', { params });
    return response.data.data;     // <-- масив станцій
  },

  getStationById: async (id) => {
    const response = await api.get(`/stations/${id}`);
    return response.data.data;     // <-- об'єкт станції
  },

  // ==============================
  // MEASUREMENTS
  // ==============================
  getMeasurements: async (params = {}) => {
    const response = await api.get('/measurements', { params });
    return response.data.data;     // <-- масив вимірювань
  },

  getLatestMeasurements: async () => {
    const response = await api.get('/measurements', { params: { limit: 20 } });
    return response.data.data;
  },

  getMeasurementsForStation: async (station_id) => {
    const response = await api.get('/measurements', {
      params: { station_id, limit: 200 }
    });
    return response.data.data;
  },

  // ==============================
  // SAVE ECO BOT SYNC
  // ==============================
  syncSaveEcoBot: async () => {
    const res = await api.get('/saveecobot/sync');
    return res.data;
  },

  // ==============================
  // HEALTH STATUS
  // ==============================
  getHealth: async () => {
    try {
      const response = await api.get(`${API_ROOT}/health`);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // ==============================
  // CRUD OPERATIONS FOR STATIONS
  // ============================== 

  createStation: async (data) => {
    const res = await api.post("/stations", data);
    return res.data;
  },

  updateStation: async (station_id, data) => {
    const res = await api.put(`/stations/${station_id}`, data);
    return res.data;
  },

  deleteStation: async (station_id) => {
    const res = await api.delete(`/stations/${station_id}`);
    return res.data;
  },
};

export default apiService;
