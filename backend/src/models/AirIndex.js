import mongoose from "mongoose";

const SubIndexSchema = new mongoose.Schema(
  {
    pollutant: { type: String, required: true },
    value: { type: Number, required: true },
    limit: { type: Number, required: true },
    subindex: { type: Number, required: true }
  },
  { _id: false }
);

const AirIndexSchema = new mongoose.Schema(
  {
    station_id: { type: String, required: true, index: true },
    datetime: { type: Date, default: Date.now, index: true },

    I: { type: Number, required: true },
    level: { type: String, required: true },

    subIndices: { type: [SubIndexSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("AirIndex", AirIndexSchema);
