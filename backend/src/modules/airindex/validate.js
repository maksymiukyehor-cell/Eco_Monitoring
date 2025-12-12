export function validatePayload(payload, limits) {
  const errors = [];

  for (const [pol, val] of Object.entries(payload)) {
    if (limits[pol] === undefined) {
      errors.push(`Unknown pollutant: ${pol}`);
      continue;
    }

    if (limits[pol].limit <= 0) {
      errors.push(`Limit for ${pol} must be > 0`);
    }

    if (val !== null && (isNaN(val) || !isFinite(val))) {
      errors.push(`Value for ${pol} must be numeric or null`);
    }
  }

  return errors;
}
