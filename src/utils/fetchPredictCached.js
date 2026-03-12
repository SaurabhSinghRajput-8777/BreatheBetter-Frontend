// src/utils/fetchPredictCached.js

// Version key to invalidate legacy/broken prediction cache states
const CACHE_VERSION = "v1";

// Predictions only update hourly from the ML chron job, but to be safe we cache for 15 mins
const CACHE_DURATION_MS = 15 * 60 * 1000;

export async function fetchPredictCached(city, fetchFn) {
    const key = `${CACHE_VERSION}_predict_cache_${city.toLowerCase()}`;
    const cached = localStorage.getItem(key);

    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            const age = Date.now() - parsed.timestamp;

            if (parsed.version === CACHE_VERSION && age < CACHE_DURATION_MS && parsed.data) {
                console.log(`[Predict Cache] Returning cached predictions for ${city}`);
                return parsed.data;
            }

            console.log(`[Predict Cache] Cache miss (expired or invalid version) for ${city}. Refetching.`);
            localStorage.removeItem(key);
        } catch (e) {
            console.warn("Error parsing predict cache:", e);
            localStorage.removeItem(key);
        }
    }

    console.log(`[Predict Cache] Fetching fresh predictions for ${city}...`);
    try {
        const fresh = await fetchFn();
        if (fresh) {
            localStorage.setItem(
                key,
                JSON.stringify({
                    version: CACHE_VERSION,
                    timestamp: Date.now(),
                    data: fresh,
                })
            );
        }
        return fresh;
    } catch (error) {
        console.error(`[Predict Cache] Predict fetch failed for ${city}:`, error);
        throw error;
    }
}
