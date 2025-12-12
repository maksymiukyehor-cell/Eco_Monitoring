
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/DATABASE.js';

import stationsRoutes from './routes/station.js';
import measurementsRoutes from './routes/measurement.js';
import saveEcoBotRoutes from './routes/saveecobot.js';
import airIndexRoutes from "./routes/airindex.js";

dotenv.config(); 
connectDB(); 

const app = express(); 
const PORT = process.env.PORT || 3000; 
 
app.use(cors());
app.use(helmet());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Головна сторінка API
app.get('/', (req, res) => { 
  res.json({
    success: true,
    message: 'Eco Monitoring API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      stations: '/api/stations',
      measurements: '/api/measurements',
      saveecobot: '/api/saveecobot'
    },
    health: '/health'
  }); 
}); 

// Health check
app.get('/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Маршрути API
app.use('/api/stations', stationsRoutes);
app.use('/api/measurements', measurementsRoutes);
app.use('/api/saveecobot', saveEcoBotRoutes);
app.use("/api/airindex", airIndexRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} is not supported`,
    available_endpoints: ['/api/stations', '/api/measurements', '/api/saveecobot']
  });
});


const server = app.listen(PORT, () => {
  console.log('======================================');
  console.log(`> EcoMon API Server Started`);
  console.log(`> Port: ${PORT}`);
  console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`> URL: http://localhost:${PORT}`);
  console.log(`> Health check: http://localhost:${PORT}/health`);
  console.log(`> Stations: http://localhost:${PORT}/api/stations`);
  console.log(`> Measurements: http://localhost:${PORT}/api/measurements`);
  console.log(`> SaveEcoBot Sync: http://localhost:${PORT}/api/saveecobot/sync`);
  console.log('======================================');
});

// shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SSIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;