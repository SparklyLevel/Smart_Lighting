// Netlify Function: /api/light-pollution?lat=..&lon=..
// Template global model (deterministic approximation).
// Replace computeGlobalModel() with real raster/geohash lookup later.

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Deterministic pseudo-noise by lat/lon (0..1)
function coordNoise(lat, lon) {
  const x = Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function sqmToBortle(sqm) {
  if (sqm >= 21.9) return 1;
  if (sqm >= 21.7) return 2;
  if (sqm >= 21.3) return 3;
  if (sqm >= 20.8) return 4;
  if (sqm >= 20.3) return 5;
  if (sqm >= 19.5) return 6;
  if (sqm >= 18.8) return 7;
  if (sqm >= 18.0) return 8;
  return 9;
}

function computeGlobalModel(lat, lon) {
  const absLat = Math.abs(lat);

  // Base darkness: poles slightly darker, tropics slightly brighter in this simplified model
  let sqm = 20.9 + (absLat / 90) * 0.35;

  // Synthetic urban pressure (0..1)
  const urban = coordNoise(lat * 1.7, lon * 1.3);
  // Brightness impact
  sqm -= urban * 3.1;

  // Ocean-like dark patches (pseudo)
  const oceanish = coordNoise(lat * 4.1 + 7, lon * 3.7 - 5);
  if (oceanish > 0.86) sqm += 0.45;

  sqm = clamp(sqm, 16.0, 22.0);
  const bortle = sqmToBortle(sqm);

  return {
    bortle,
    sqm: Number(sqm.toFixed(2)),
    source: "Global model (template)",
    sourceType: "global",
    confidence: "model"
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const lat = Number(event.queryStringParameters?.lat);
  const lon = Number(event.queryStringParameters?.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "lat/lon query params are required numbers" })
    };
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "lat or lon out of range" })
    };
  }

  const payload = computeGlobalModel(lat, lon);

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=3600"
    },
    body: JSON.stringify(payload)
  };
};

