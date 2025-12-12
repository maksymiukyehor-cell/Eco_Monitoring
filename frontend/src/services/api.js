import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const API_ROOT = process.env.REACT_APP_ROOT_URL || "http://localhost:3000";


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});


export const apiService = {
  getStations: async (params = {}) => {
    const response = await api.get('/stations', { params });
    return response.data.data;   
  },

  getStationById: async (id) => {
    const response = await api.get(`/stations/${id}`);
    return response.data.data; 
  },

  getMeasurements: async (params = {}) => {
    const response = await api.get('/measurements', { params });
    return response.data.data; 
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

  syncSaveEcoBot: async () => {
    const res = await api.get('/saveecobot/sync');
    return res.data;
  },

  getHealth: async () => {
    try {
      const response = await api.get(`${API_ROOT}/health`);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

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

  calculateAirIndex: async (payload) => {
    const response = await api.post("/airindex/calc", payload);
    return response.data;
  },
};

export default apiService;
