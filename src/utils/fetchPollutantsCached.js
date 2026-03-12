// src/utils/fetchPollutantsCached.js

// ─── CACHE CONFIG ─────────────────────────────────────────────────────
// Version key: Bump this after any backend logic change (e.g. AQI formula fix)
// to auto-invalidate all stale localStorage entries across all users.
const CACHE_VERSION = "v2";

// TTL: 5 minutes. Matches the reality that pollutant data updates frequently.
// Previously 30 min, which caused stale AQI values to persist too long.
const CACHE_DURATION_MS = 5 * 60 * 1000;

// Safety net: If a cached entry is older than 2× the scheduler interval (6h),
// it's definitely stale regardless of version — force refetch.
const MAX_STALENESS_MS = 2 * 6 * 60 * 60 * 1000; // 12 hours

// ─── VALIDATOR ────────────────────────────────────────────────────────
// After the AQI formula fix, valid responses include an 'aqi' field.
// If a cached response is missing this field, it came from before the fix.
function isResponseValid(data) {
  if (!data) return false;
  // Must have at least one pollutant field AND the computed AQI field
  if (data.co === undefined && data.no2 === undefined) return false;
  if (data.aqi === undefined || data.aqi === null) return false;
  return true;
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────
export async function fetchPollutantsCached(city, fetchFn) {
  const key = `${CACHE_VERSION}_pollutants_cache_${city.toLowerCase()}`;

  // ── 1. Check localStorage ──────────────────────────────────────────
  const cached = localStorage.getItem(key);

  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      const now = Date.now();
      const age = now - parsed.timestamp;

      // CHECK: Version mismatch → old cache format, discard
      if (parsed.version !== CACHE_VERSION) {
        console.log(`[Pollutants Cache] VERSION MISMATCH for ${city}. Stored=${parsed.version}, Current=${CACHE_VERSION}. Invalidating.`);
        localStorage.removeItem(key);
        // Also clean up any keys from the old version format
        _cleanOldVersionKeys(city);
      }
      // CHECK: Exceeds max staleness (2× scheduler interval) → definitely stale
      else if (age > MAX_STALENESS_MS) {
        console.log(`[Pollutants Cache] STALE (>${MAX_STALENESS_MS / 3600000}h) for ${city}. Age=${Math.round(age / 60000)}min. Refetching.`);
        localStorage.removeItem(key);
      }
      // CHECK: Missing required fields (e.g. 'aqi' field from before the fix)
      else if (!isResponseValid(parsed.data)) {
        console.log(`[Pollutants Cache] INVALID DATA for ${city} (missing 'aqi' field). Refetching.`);
        localStorage.removeItem(key);
      }
      // CHECK: Normal TTL expiry
      else if (age > CACHE_DURATION_MS) {
        console.log(`[Pollutants Cache] EXPIRED for ${city}. Age=${Math.round(age / 60000)}min > TTL=${CACHE_DURATION_MS / 60000}min. Refetching.`);
        localStorage.removeItem(key);
      }
      // ✅ Cache HIT — valid, fresh, correct version
      else {
        console.log(`[Pollutants Cache] HIT for ${city}. Age=${Math.round(age / 1000)}s. Returning cached data.`);
        return parsed.data;
      }
    } catch (e) {
      console.warn("[Pollutants Cache] Parse error, clearing and refetching:", e);
      localStorage.removeItem(key);
    }
  } else {
    console.log(`[Pollutants Cache] MISS for ${city}. No cached entry found.`);
  }

  // ── 2. Fetch fresh data from API ───────────────────────────────────
  try {
    const fresh = await fetchFn();

    if (isResponseValid(fresh)) {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: CACHE_VERSION,
          timestamp: Date.now(),
          data: fresh,
        })
      );
      console.log(`[Pollutants Cache] SET new cache for ${city}. PM2.5=${fresh.pm25}, AQI=${fresh.aqi}`);
    } else {
      console.warn(`[Pollutants Cache] API returned incomplete data for ${city}, not caching.`);
    }

    return fresh;
  } catch (error) {
    console.error(`[Pollutants Cache] API fetch FAILED for ${city}:`, error);
    throw error;
  }
}

// ─── CLEANUP HELPER ───────────────────────────────────────────────────
// Removes leftover keys from older cache versions (e.g. "v1_pollutants_cache_delhi")
function _cleanOldVersionKeys(city) {
  const cityLower = city.toLowerCase();
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.includes("pollutants_cache_") && k.includes(cityLower) && !k.startsWith(CACHE_VERSION)) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach((k) => {
    localStorage.removeItem(k);
    console.log(`[Pollutants Cache] Cleaned old key: ${k}`);
  });
}