import express from 'express';
import Station from '../models/Station.js';

const router = express.Router();

//CREATE

router.post('/', async (req, res) => {
    try {
        const { station_id, city_name, station_name, local_name, timezone, location, platform_name, measured_parameters } = req.body;

        if (!station_id || !city_name || !station_name || !location || !platform_name) {
            return res.status(400).json({
                success: false,
                error: 'station_id, city_name, station_name, location і platform_name requiered'
            });
        };

        const existingStation = await Station.findOne({ station_id });

        if (existingStation) {
            return res.status(409).json({
                success: false,
                error: 'Station with this station_id already exists'
            });
        };

        const station = new Station({
            station_id,
            city_name,  
            station_name,
            local_name,
            timezone,
            location,
            platform_name,
            measured_parameters
        });

        await station.save();

        res.status(201).json({ success: true, data: station }); 
        } catch (error) {
        res.status(500).json({ success: false, error: error.message });

    }
});

//READ

router.get('/:station_id', async (req, res) => {
    try {
        const { station_id } = req.params;

        const station = await Station.findOne({ station_id });

        if (!station) { 
            return res.status(404).json({ success: false, error: 'Station not found' });
        }

        res.status(200).json({ success: true, data: station });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/', async (req, res) => {
  try {
    const { city, status, page = 1, limit = 50 } = req.query;
    
    // filter
    const filter = {};
    if (city) filter.city_name = { $regex: city, $options: 'i' };
    if (status) filter.status = status;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { city_name: 1, station_name: 1 }
    };
    
    const stations = await Station.find(filter)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);
    
    const total = await Station.countDocuments(filter);
    
    res.json({
      success: true,
      data: stations,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
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
        const updateData = req.body;

        const station = await Station.findOneAndUpdate({ station_id }, updateData, { new: true });

        if (!station) {
            return res.status(404).json({ success: false, error: 'Station not found' });
        }

        res.status(200).json({ success: true, data: station });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

//DELETE

router.delete('/:station_id', async (req, res) => {
    try {
        const { station_id } = req.params;

        const station = await Station.findOneAndDelete({ station_id });

        if (!station) {
            return res.status(404).json({ success: false, error: 'Station not found' });
        }
        res.status(200).json({ success: true, message: 'Station deleted successfully' });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Отримати всі станції



export default router;