import { computeAirIndex } from "../modules/airindex/compute.js";
import { LIMITS } from "../../constantts/limits.js";


describe("computeAirIndex()", () => {
  
  test("Correctly computes sub-index for a single pollutant", () => {
    const values = {
      "PM2.5": 50
    };

    const result = computeAirIndex(values);

    expect(result.I).toBe(Math.round(50 / LIMITS["PM2.5"] * 100));
    expect(result.subIndices.length).toBe(1);

    const entry = result.subIndices[0];
    expect(entry.pollutant).toBe("PM2.5");
    expect(entry.value).toBe(50);
    expect(entry.limit).toBe(LIMITS["PM2.5"]);
    expect(entry.subindex).toBe(Math.round(50 / LIMITS["PM2.5"] * 100));
  });


  test("Handles multiple pollutants and computes average index", () => {
    const values = {
      "PM2.5": 25,
      "PM10": 50
    };

    const expectedPM25 = Math.round(25 / LIMITS["PM2.5"] * 100);
    const expectedPM10 = Math.round(50 / LIMITS["PM10"] * 100);
    const expectedAvg = Math.round((expectedPM25 + expectedPM10) / 2);

    const result = computeAirIndex(values);

    expect(result.I).toBe(expectedAvg);
    expect(result.subIndices.length).toBe(2);
  });


  test("Ignores pollutants not present in LIMITS", () => {
    const values = {
      "Humidity": 90,
      "PM10": 40
    };

    const result = computeAirIndex(values);

    expect(result.subIndices.length).toBe(1);
    expect(result.subIndices[0].pollutant).toBe("PM10");
  });


  test("Skips NaN values", () => {
    const values = {
      "PM2.5": "abc",
      "PM10": 100
    };

    const result = computeAirIndex(values);

    expect(result.subIndices.length).toBe(1);
    expect(result.subIndices[0].pollutant).toBe("PM10");
  });


  test("Returns zero index when no valid pollutants exist", () => {
    const values = {
      "Humidity": 90,
      "Temperature": 20
    };

    const result = computeAirIndex(values);

    expect(result.I).toBe(0);
    expect(result.subIndices.length).toBe(0);
    expect(result.level).toBe("good");
  });


  test("Correct level classification", () => {
    const values = {
      "PM2.5": LIMITS["PM2.5"] * 2 // gives subindex = 200
    };

    const result = computeAirIndex(values);

    expect(result.I).toBe(200);
    expect(result.level).toBe("unhealthy");
  });

});
