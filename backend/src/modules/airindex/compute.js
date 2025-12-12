import { LIMITS } from "../../../constantts/limits.js";

export function computeAirIndex(values) {
  const subIndices = [];
  let sum = 0;
  let n = 0;

  Object.keys(values).forEach((pol) => {
    const value = Number(values[pol]);
    const limit = LIMITS[pol];

    if (!limit || isNaN(value)) return;

    const sub = Math.round((value / limit) * 100);

    subIndices.push({
      pollutant: pol,
      value,
      limit,
      subindex: sub
    });

    sum += sub;
    n++;
  });

  const I = n ? Math.round(sum / n) : 0;

  let level = "good";
  if (I > 50) level = "moderate";
  if (I > 100) level = "bad";
  if (I > 150) level = "unhealthy";

  return { I, level, subIndices };
}
