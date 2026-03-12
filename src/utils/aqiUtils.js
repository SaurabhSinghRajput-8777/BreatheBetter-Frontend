// src/utils/aqiUtils.js
// ─── Centralized CPCB AQI Logic ─────────────────────────────────────
// Single source of truth for PM2.5 → AQI conversion across the entire frontend.
// Uses official Indian CPCB breakpoints. Do NOT duplicate this logic elsewhere.

// Official CPCB PM2.5 breakpoints: (BP_lo, BP_hi, I_lo, I_hi)
const CPCB_PM25_BREAKPOINTS = [
    { bpLo: 0, bpHi: 30, iLo: 0, iHi: 50, category: "Good" },
    { bpLo: 31, bpHi: 60, iLo: 51, iHi: 100, category: "Satisfactory" },
    { bpLo: 61, bpHi: 90, iLo: 101, iHi: 200, category: "Moderate" },
    { bpLo: 91, bpHi: 120, iLo: 201, iHi: 300, category: "Poor" },
    { bpLo: 121, bpHi: 250, iLo: 301, iHi: 400, category: "Very Poor" },
    { bpLo: 251, bpHi: 380, iLo: 401, iHi: 500, category: "Severe" },
];

/**
 * Converts raw PM2.5 concentration (µg/m³) to AQI using CPCB formula:
 * AQI = (I_hi - I_lo) / (BP_hi - BP_lo) × (C_p - BP_lo) + I_lo
 *
 * @param {number|null} pm25 - Raw PM2.5 value in µg/m³
 * @returns {number} Computed AQI (0–500)
 */
export function pm25ToAQI(pm25) {
    if (pm25 === null || pm25 === undefined || isNaN(parseFloat(pm25))) return 0;
    const pm = parseFloat(pm25);

    if (pm <= 0) return 0;

    for (const bp of CPCB_PM25_BREAKPOINTS) {
        if (pm <= bp.bpHi) {
            const aqi = Math.round(
                ((bp.iHi - bp.iLo) / (bp.bpHi - bp.bpLo)) * (pm - bp.bpLo) + bp.iLo
            );
            console.debug(
                `[AQI Debug] PM2.5=${pm} µg/m³ → AQI=${aqi} | breakpoint=[${bp.bpLo}-${bp.bpHi}] → AQI[${bp.iLo}-${bp.iHi}] (${bp.category}) | standard=CPCB`
            );
            return aqi;
        }
    }

    // Beyond scale — cap at 500
    console.debug(`[AQI Debug] PM2.5=${pm} µg/m³ → AQI=500 (beyond CPCB scale) | standard=CPCB`);
    return 500;
}

/**
 * Returns CPCB category label for a given AQI value.
 * @param {number|null} aqi
 * @returns {string}
 */
export function getAQICategory(aqi) {
    if (aqi === null || aqi === undefined || aqi === "...") return "Loading...";
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Satisfactory";
    if (aqi <= 200) return "Moderate";
    if (aqi <= 300) return "Poor";
    if (aqi <= 400) return "Very Poor";
    return "Severe";
}

/**
 * Returns a theme color for a given AQI value.
 * @param {number} aqi
 * @returns {string} hex color
 */
export function getAQIColor(aqi) {
    if (aqi <= 50) return "#00E400";      // Good — green
    if (aqi <= 100) return "#84CF33";     // Satisfactory — light green
    if (aqi <= 200) return "#F0D400";     // Moderate — yellow
    if (aqi <= 300) return "#F07554";     // Poor — orange
    if (aqi <= 400) return "#8F3F97";     // Very Poor — purple
    return "#7E0023";                     // Severe — maroon
}
