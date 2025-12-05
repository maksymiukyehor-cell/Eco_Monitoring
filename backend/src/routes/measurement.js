import express from 'express';
import Measurement from '../models/Measurement.js';
import Station from '../models/Station.js';


const router = express.Router();

//CREATE

router.post('/', async (req, res) => {
  try {
    const { station_id, measurement_time, pollutants } = req.body;

    if (!station_id || !pollutants || !Array.isArray(pollutants)) {
      return res.status(400).json({
        success: false,
        error: 'station_id і pollutants (масив) обов\'язкові'
      });
    }

    const measurement = new Measurement({
      station_id,
      measurement_time: measurement_time ? new Date(measurement_time) : new Date(),
      pollutants
    });

    await measurement.save();

    // Оновлення часу останнього вимірювання станції
    const station = await Station.findOne({ station_id });
    if (station) await station.updateLastMeasurement();

    res.status(201).json({ success: true, data: measurement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


//READ
router.get('/read/:station_id', async (req, res) => {
    try{
        const { station_id } = req.params;
        const { pollutant } = req.query;

        if (!pollutant) {
            return res.status(400).json({
                success: false,
                error: 'pollutant requierd'
            });
        }

        const statistics = await Measurement.getStatisticsPollutant(
            station_id, pollutant
        );

        res.json({
            success: true,
            data: statistics[0] || null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


router.get('/', async (req, res) => {
  try {
    const {
      station_id,
      start_date,
      end_date,
      pollutant,
      page = 1,
      limit = 100
    } = req.query;
    
    // Побудова фільтра
    const filter = {};
    if (station_id) filter.station_id = station_id;
    if (start_date || end_date) {
      filter.measurement_time = {};
      if (start_date) filter.measurement_time.$gte = new Date(start_date);
      if (end_date) filter.measurement_time.$lte = new Date(end_date);
    }
    if (pollutant) filter['pollutants.pollutant'] = pollutant;
    
    const measurements = await Measurement.find(filter)
      .sort({ measurement_time: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      // .populate('station_id', 'station_name city_name');
    
    const total = await Measurement.countDocuments(filter);
    
    res.json({
      success: true,
      data: measurements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

//UPDATE

router.put('/:station_id', async (req, res) => {
  try {
    const { station_id } = req.params;
    const { measurement_time, pollutants } = req.body;

    if (!measurement_time) {
      return res.status(400).json({
        success: false, error: 'measurement_time is required to identify the record' 
        });
    }

    const updateData = {};
    if (pollutants) updateData.pollutants = pollutants;

    const measurement = await Measurement.findOneAndUpdate(
      { station_id, measurement_time: new Date(measurement_time) },
      updateData,
      { new: true }
    );

    if (!measurement) {
      return res.status(404).json({ success: false, error: 'Measurement not found' });
    }

    // Оновлення часу останнього вимірювання станції
    const station = await Station.findOne({ station_id });
    if (station) await station.updateLastMeasurement();

    res.json({ success: true, data: measurement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//DELETE

router.delete('/:station_id', async (req, res) => {
  try {
    const stationId = req.params.station_id;
    const { measurement_time } = req.body;

    if (!measurement_time) {
      return res.status(400).json({
        success: false,
        error: 'measurement_time query parameter is required'
      });
    }

    const result = await Measurement.deleteOne({
      station_id: stationId,
      measurement_time: new Date(measurement_time)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: `No measurement found for station ${stationId} at time ${measurement_time}`
      });
    }

    res.json({
      success: true,
      message: `Measurement for station ${stationId} at ${measurement_time} deleted successfully`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});




export default router;