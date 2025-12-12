import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../src/config/DATABASE.js";
import AirIndex from "../src/models/AirIndex.js";
import { LIMITS } from "../constantts/limits.js";

dotenv.config();

const POLLUTANTS = ["PM2.5", "PM10", "NO2", "SO2", "O3"];

function randomInRange(min, max) {
  return +(min + Math.random() * (max - min)).toFixed(2);
}

function generateSubIndexData() {
  return POLLUTANTS.map(p => {
    const v = randomInRange(5, LIMITS[p] * 2);

    const limit = LIMITS[p];
    const sub = Math.round((v / limit) * 100);

    return {
      pollutant: p,
      value: v,
      limit,
      subindex: sub,
    };
  });
}

async function runSeed() {
  console.log("=== Running AirIndex Seeder ===");

  try {

    await connectDB();

    await AirIndex.deleteMany({});
    console.log("Old AirIndex records cleared.");

    const data = [];

    for (let i = 1; i <= 20; i++) {
      const subIndices = generateSubIndexData();

      const avgI = Math.round(
        subIndices.reduce((sum, s) => sum + s.subindex, 0) / subIndices.length
      );

      const level =
        avgI > 150 ? "unhealthy" :
        avgI > 100 ? "bad" :
        avgI > 50 ? "moderate" :
        "good";

      data.push({
        station_id: `TEST_STATION_${i}`,
        datetime: new Date(Date.now() - i * 3600 * 1000), 
        I: avgI,
        level,
        subIndices,
      });
    }

    await AirIndex.insertMany(data);
    console.log("Seed inserted successfully!");

  } catch (err) {
    console.error("Seed Error:", err);
  } finally {
    
    await mongoose.connection.close();
    console.log("DB connection closed.");
  }
}

runSeed();
