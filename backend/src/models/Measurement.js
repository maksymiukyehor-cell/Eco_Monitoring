import mongoose from 'mongoose';

const PollutantSchema = new mongoose.Schema({
    pollutant: {
        type: String,
        required: true,
        enum: ['PM2.5', 'PM10', 'Temperature', 'Humidity', 'Pressure', 'Air Quality Index', 'NO2', 'SO2', 'CO', 'O3']
    },

    value: {
        type: Number,
        required: true,
        validate: {
            validator: function(v) {
                return !isNaN(v) && isFinite(v);
            },
            message: 'Value must be a valid number'
        }
    },

    unit: {
        type: String,
        required: true,
        enum: ['ug/m3', 'Celcius', '%', 'hPa', 'aqi', 'mg/m3', 'ppm']
    },

    averaging_period: {
    type: String,
    default: '2 minutes',
    enum: ['1 minute', '2 minutes', '5 minutes', '15 minutes', '1 hour', '24 hours']
    },
  
    quality_flag: {
        type: String,
        enum: ['valid', 'invalid', 'estimated', 'preliminary'],
        default: 'preliminary'
    }
}, { _id: false});

const MeasurementSchema = new mongoose.Schema({
  station_id: {
    type: String,
    required: true,
    index: true
  },
  
  measurement_time: {
    type: Date,
    required: true,
    index: true
  },
  
  pollutants: [PollutantSchema],
  
  metadata: {
    source: {
      type: String,
      default: 'SaveEcoBot'
    },
    import_time: {
      type: Date,
      default: Date.now
    },
    original_data: mongoose.Schema.Types.Mixed, 
    processing_notes: String 
  }
}, { timestamps: true });

MeasurementSchema.statics.getStatisticsPollutant = async function(stationId, pollutant) { 
  const matchStage = { //filter
    station_id: stationId,
    'pollutants.pollutant': pollutant
  };

  //aggregation
  return await this.aggregate([ 
    { $match: matchStage }, 
    { $unwind: '$pollutants' }, 
    { $match: { 'pollutants.pollutant': pollutant } }, 
    {
      $project: {
        _id: stationId,
        measurement_time: 1,
        pollutant: '$pollutants.pollutant',
        value: '$pollutants.value',
        unit: '$pollutants.unit',
        averaging_period: '$pollutants.averaging_period',
        quality: '$pollutants.quality_flag'
      }
    } 
  ]);
};

MeasurementSchema.statics.getStatisticsInTime = async function(stationId, startDate, endDate) {
  const matchStage = { //filter
    station_id: stationId
  };

  if (startDate || endDate) {
    matchStage.measurement_time = {};
    if (startDate) matchStage.measurement_time.$gte = new Date(startDate);
    if (endDate) matchStage.measurement_time.$lte = new Date(endDate);
  }

  return await this.aggregate([ 
    { $match: matchStage },         
    { $unwind: '$pollutants' },    
    {
      $project: {                  
        _id: 1,
        station_id: 1,
        measurement_time: 1,
        pollutant: '$pollutants.pollutant',
        value: '$pollutants.value',
        unit: '$pollutants.unit',
        averaging_period: '$pollutants.averaging_period',
        quality: '$pollutants.quality_flag'
      }
    },
    { $sort: { measurement_time: -1, pollutant: 1 } }
  ]);
};

export default mongoose.model('Measurement', MeasurementSchema);