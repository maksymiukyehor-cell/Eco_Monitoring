
import express from 'express';
import fetch from 'node-fetch';
import Measurement from '../models/Measurement.js';
import Station from '../models/Station.js';

const router = express.Router();


// data sync from SaveEcoBot
router.get('/sync', async (req, res) => {
  try {
    console.log('Starting SaveEcoBot data sync...');
    
    // Запит до SaveEcoBot API
    const response = await fetch(process.env.SAVEECOBOT_API || 'https://api.saveecobot.com/output.json');
    
    if (!response.ok) {
      throw new Error(`SaveEcoBot API error: ${response.statusText}`);
    }
    
    const saveEcoBotData = await response.json();
    console.log(`Received ${saveEcoBotData.length} stations from SaveEcoBot`);
    
    const results = {
      stations_processed: 0,
      stations_created: 0,
      stations_updated: 0,
      measurements_created: 0,
      errors: []
    };
    
    // Обробка кожної станції 
    for (const stationData of saveEcoBotData) {
      try {
        results.stations_processed++;
        
        // Перетворення даних станції у формат моделі Station
        const stationInfo = {
          station_id: stationData.id,
          city_name: stationData.cityName,
          station_name: stationData.stationName || `Unnamed Station ${stationData.id}`,
          local_name: stationData.localName || '',
          timezone: stationData.timezone,
          location: {
            type: 'Point',
            coordinates: [parseFloat(stationData.longitude), parseFloat(stationData.latitude)]
          },
          platform_name: stationData.platformName,
          measured_parameters: stationData.pollutants.map(p => p.pol)
        };
        
        // Створення або оновлення станції в базі даних
        let station = await Station.findOne({ station_id: stationInfo.station_id });
        if (!station) {
          station = new Station(stationInfo);
          await station.save(); 
          results.stations_created++;
          console.log(`Created station: ${stationInfo.station_id}`);
        } else {
          await Station.findOneAndUpdate(
            { station_id: stationInfo.station_id },
            { ...stationInfo, 'metadata.updated_at': new Date() },
            { new: true }
          );
          results.stations_updated++;
        }
        
        // Групування вимірювань за часом
        const measurementGroups = {};
        
        stationData.pollutants.forEach(pollutantData => {
          if (pollutantData.time && pollutantData.value !== null && pollutantData.value !== undefined) {
            const timeKey = pollutantData.time; 
            
            if (!measurementGroups[timeKey]) { 
              measurementGroups[timeKey] = { 
                measurement_time: new Date(pollutantData.time),
                pollutants: []
              }; 
            }
            
            measurementGroups[timeKey].pollutants.push({ 
              pollutant: pollutantData.pol,
              value: pollutantData.value,
              unit: pollutantData.unit,
              averaging_period: pollutantData.averaging,
              quality_flag: 'valid'
            });
          }
        });
        
        // Створення вимірювань
        for (const [timeKey, measurementGroup] of Object.entries(measurementGroups)) { 
          const existingMeasurement = await Measurement.findOne({
            station_id: stationData.id,
            measurement_time: measurementGroup.measurement_time
          });
          
          if (!existingMeasurement && measurementGroup.pollutants.length > 0) { 
            const measurement = new Measurement({ 
              station_id: stationData.id,
              measurement_time: measurementGroup.measurement_time,
              pollutants: measurementGroup.pollutants,
              metadata: {
                source: 'SaveEcoBot',
                original_data: stationData
              }
            });
            
            await measurement.save(); 
            results.measurements_created++; 
          }
        }
        
        await station.updateLastMeasurement();

      } catch (error) {
        console.error(`Error processing station ${stationData.id}:`, error.message);
        results.errors.push({
          station_id: stationData.id,
          error: error.message
        });
      }
    }
    
    console.log('SaveEcoBot sync completed');
    console.log(`Results:`, results);
    
    res.json({ 
      success: true,
      message: 'SaveEcoBot data synchronized successfully',
      results
    });
    
  } catch (error) { 
    console.error('SaveEcoBot sync failed:', error);
    res.status(500).json({ 
      success: false,
      error: `Failed to sync with SaveEcoBot: ${error.message}`
    });
  }
});

// Статус синхронізації
router.get('/status', async (req, res) => { 
  try {
    const totalStations = await Station.countDocuments(); 
    const activeStations = await Station.countDocuments({ status: 'active' });
    const totalMeasurements = await Measurement.countDocuments();

    const lastMeasurement = await Measurement.findOne() 
      .sort({ measurement_time: -1 })
      .select('measurement_time metadata.source');

    const stationsWithRecentData = await Measurement.aggregate([ 
      {
        $match: { 
          measurement_time: { 
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) 
          }
        }
      },
      {
        $group: { 
          _id: '$station_id'
        }
      },
      {
        $count: 'stations_with_recent_data' 
      }
    ]);
    
    res.json({ 
      success: true,
      data: {
        total_stations: totalStations,
        active_stations: activeStations,
        total_measurements: totalMeasurements,
        last_measurement_time: lastMeasurement?.measurement_time,
        last_measurement_source: lastMeasurement?.metadata?.source,
        stations_with_recent_data: stationsWithRecentData[0]?.stations_with_recent_data || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;