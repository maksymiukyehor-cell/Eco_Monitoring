import express from "express";
import Measurement from "../models/Measurement.js";
import AirIndex from "../models/AirIndex.js";
import { computeAirIndex } from "../modules/airindex/compute.js";
import { LIMITS, SYNTHESIS_RANGES } from "../../constantts/limits.js";

const router = express.Router();

// POST /api/airindex/calc
router.post("/calc", async (req, res) => {
  try {
    const { station_id, manual } = req.body;

    if (!station_id)
      return res.status(400).json({ success: false, error: "station_id required" });

    const raw = await Measurement.find({ station_id })
      .sort({ measurement_time: -1 })
      .limit(50);

    if (!raw.length)
      return res.json({ success: true, data: { I: 0, level: "no-data", subIndices: {} } });

    const collected = {};

    raw.forEach((m) => {
      m.pollutants.forEach((p) => {
        if (!LIMITS[p.pollutant]) return;

        if (!collected[p.pollutant]) collected[p.pollutant] = [];

        collected[p.pollutant].push(p.value);
      });
    });

    const finalValues = {};

    Object.keys(LIMITS).forEach((pol) => {
      if (manual && manual[pol])
        finalValues[pol] = manual[pol];
      else if (collected[pol] && collected[pol].length)
        finalValues[pol] = collected[pol][0];
      else {
        const r = SYNTHESIS_RANGES[pol];
        finalValues[pol] = +(Math.random() * (r.max - r.min) + r.min).toFixed(1);
      }
    });

    const result = computeAirIndex(finalValues);

    const saved = await AirIndex.create({
      station_id,
      datetime: new Date(),
      I: result.I,
      level: result.level,
      subIndices: result.subIndices,
    });

    res.json({ success: true, data: saved });

  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
