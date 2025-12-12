
export function generateSyntheticValue(min, max, hour) {

  const wave = Math.sin((2 * Math.PI * hour) / 24);

  const noise = (Math.random() - 0.5) * 0.2;

  let base = min + (max - min) * (0.5 + 0.5 * wave + noise);

  if (base < min) base = min;
  if (base > max) base = max;

  return Number(base.toFixed(2));
}

export function generateMissingPollutants(existing, limits) {
  const now = new Date();
  const hour = now.getHours();

  const out = {};

  for (const pol of Object.keys(limits)) {
    if (existing[pol] !== undefined) continue;

    const { min, max } = limits[pol];

    if (Math.random() < 0.2) {
      out[pol] = null;
      continue;
    }

    out[pol] = generateSyntheticValue(min, max, hour);
  }

  return out;
}
