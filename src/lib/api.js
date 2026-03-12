// src/lib/api.js
export const DEFAULT_BASE = import.meta.env.VITE_API_BASE_URL;

const API_BASE = DEFAULT_BASE;

if (!API_BASE) {
  console.error("[API] ❌ VITE_API_BASE_URL is not set! All API calls will fail.");
}

async function fetchJson(path, opts = {}) {
  if (!API_BASE) throw new Error("API_BASE is undefined — set VITE_API_BASE_URL in .env");

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text();
    let err;
    try { err = JSON.parse(text); } catch (e) { err = text; }
    throw new Error(`API ${path} failed: ${res.status} ${res.statusText} — ${JSON.stringify(err)}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function getCurrentAQI(city = "Delhi") {
  return fetchJson(`/current_aqi?city=${encodeURIComponent(city)}`);
}

export async function getPredict(city = "Delhi") {
  try {
    if (!API_BASE) throw new Error("API_BASE is undefined");

    const url = `${API_BASE}/predictions?city=${encodeURIComponent(city)}`;
    console.log(`[API] Fetching /predictions for ${city} at URL: ${url}`);

    const response = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!response.ok) throw new Error(`API fetch failed: ${response.status}`);
    const data = await response.json();
    console.log(`[API] Raw response for ${city}:`, data);

    // Guard: backend may return message-only response when no predictions exist
    if (data?.message || !data?.predictions) {
      console.warn(`[API] No predictions available for ${city}:`, data?.message || "missing predictions key");
      return { predictions: [], confidence_low: null, confidence_high: null, aqi_category: null, generated_at: null };
    }

    if (data && data.predictions && Array.isArray(data.predictions)) {
      const baseTime = data.generated_at ? new Date(data.generated_at).getTime() : Date.now();

      // Map the new flat array format back into the object structure expected by UI components
      data.predictions = data.predictions.map((pm25Val, i) => ({
        hour_index: i,
        datetime: new Date(baseTime + (i * 3600 * 1000)).toISOString(),
        pm25: pm25Val,
        lower_95: data.confidence_low,
        upper_95: data.confidence_high
      }));
      console.log(`[API] Mapped predictions array length:`, data.predictions.length);
    }

    return data;
  } catch (err) {
    console.error(`[API] FATAL ERROR fetching /predictions for ${city}:`, err);
    throw err;
  }
}

export async function getLivePollutants(city = "Delhi") {
  return fetchJson(`/live_pollutants?city=${encodeURIComponent(city)}`);
}

export async function getHistory(city = "Delhi", days = 7) {
  return fetchJson(`/history?city=${encodeURIComponent(city)}&days=${days}`);
}

export async function getWeeklyForecast(city = "Delhi") {
  return fetchJson(`/forecast/weekly?city=${encodeURIComponent(city)}`);
}

export async function getHeatmapGeoJSON(city = "Delhi", days = 1) {
  return fetchJson(`/spatial_heatmap?city=${encodeURIComponent(city)}&days=${days}`);
}

export async function trainModel(city = "Delhi", days = 30) {
  return fetchJson(`/train?city=${encodeURIComponent(city)}&days=${days}`);
}

export async function getModelMetrics(city = "Delhi") {
  return fetchJson(`/metrics?city=${encodeURIComponent(city)}`);
}

// 🔥 CRITICAL FIX: Ensure 'days' is passed correctly to the URL
export async function downloadPdfReport(city = "Delhi", days = 7) {
  const url = `${DEFAULT_BASE}/report/pdf?city=${encodeURIComponent(city)}&days=${days}`;
  console.log(`Downloading Report from: ${url}`); // Debug log
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to download PDF");
  return res.blob();
}