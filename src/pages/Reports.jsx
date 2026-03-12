// src/pages/Reports.jsx
import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { getLivePollutants, getPredict } from "../lib/api";
import { fetchPollutantsCached } from "../utils/fetchPollutantsCached";
import { fetchPredictCached } from "../utils/fetchPredictCached";

// ── Helpers ──
// Pure UI mapping. Avoids duplicate AQI math and relies solely on backend labels.
function getCategoryColor(category) {
  switch (category?.toLowerCase()) {
    case "good": return "#00E400";
    case "satisfactory": return "#84CF33";
    case "moderate": return "#F0D400";
    case "poor": return "#F07554";
    case "very poor": return "#8F3F97";
    case "severe": return "#7E0023";
    default: return "#6B7280";
  }
}

export default function Reports() {
  const { city } = useContext(ThemeContext);
  const [days, setDays] = useState(7);
  const [downloading, setDownloading] = useState(false);

  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // Fetch preview data on mount + city change
  useEffect(() => {
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(false);

    (async () => {
      try {
        // Parallel fetch using cache for live data to prevent duplicates
        const [liveData, predData] = await Promise.all([
          fetchPollutantsCached(city, () => getLivePollutants(city)),
          fetchPredictCached(city, () => getPredict(city)),
        ]);

        if (cancelled) return;

        // Current actuals directly from API (no local AQI recalculation)
        const currentAqi = liveData?.aqi ?? "--";
        const currentCat = liveData?.category ?? "--";

        // Forecast stats from predictions (PM2.5 values)
        let forecastPeak = "--";
        let forecastLow = "--";
        let forecastPeakCat = predData?.aqi_category || "--";
        let trend = "--";
        let confStr = "N/A";

        if (predData?.predictions?.length > 0) {
          // api.js maps predictions to objects: { pm25: ... }
          const vals = predData.predictions
            .map(p => p.pm25)
            .filter((v) => v != null && !isNaN(parseFloat(v)) && v >= 0);

          if (vals.length > 0) {
            forecastPeak = Math.max(...vals).toFixed(1) + " µg/m³";
            forecastLow = Math.min(...vals).toFixed(1) + " µg/m³";

            // Trend: compare first half vs second half
            const mid = Math.floor(vals.length / 2);
            const firstHalf = vals.slice(0, mid);
            const secondHalf = vals.slice(mid);
            const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / (firstHalf.length || 1);
            const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / (secondHalf.length || 1);
            const delta = ((avgSecond - avgFirst) / (avgFirst || 1)) * 100;

            if (delta > 10) trend = "Rising ↑";
            else if (delta < -10) trend = "Falling ↓";
            else trend = "Stable →";
          }

          if (predData.confidence_low != null && predData.confidence_high != null) {
            confStr = `${predData.confidence_low.toFixed(1)} – ${predData.confidence_high.toFixed(1)} µg/m³`;
          }
        }

        setPreview({
          currentAqi,
          currentCat,
          forecastPeak,
          forecastLow,
          forecastPeakCat,
          trend,
          confStr,
        });
      } catch (err) {
        console.error("[Reports] Preview fetch failed:", err);
        if (!cancelled) {
          setPreviewError(true);
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [city]);

  const handleDownload = () => {
    setDownloading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const url = `${API_BASE}/report/pdf?city=${encodeURIComponent(city)}&days=${days}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = `${city}_BreatheBetter_Report_${days}Days.pdf`;
      a.target = "_self";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("Download failed", e);
      alert("Failed to download report. Please try again.");
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[--bg] transition-colors pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl text-indigo-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              Analytics & Reporting
            </h1>
            <p className="text-sm text-secondary mt-1 ml-1">
              Generate comprehensive insights, historical trends, and AI-powered forecasts for <span className="font-bold text-primary">{city}</span>.
            </p>
          </div>
        </div>

        {/* ── PREVIEW STRIP ── */}
        <div className="rounded-2xl border border-[var(--card-border)] dark:border-white/[0.06] bg-[var(--card)] dark:bg-white/[0.04] backdrop-blur-md p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Live Report Preview — {city}
            </span>
          </div>

          {!preview && previewLoading ? (
            // Minimal loader - no skeleton flash
            <div className="flex items-center gap-3 h-20 text-secondary text-sm px-2">
              <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Loading preview data...
            </div>
          ) : previewError ? (
            // Graceful fallback on error
            <div className="h-20 flex items-center text-sm text-red-500 bg-red-50 dark:bg-red-900/10 px-4 rounded-xl border border-red-100 dark:border-red-900/50">
              Unable to load preview data. Please check your connection.
            </div>
          ) : preview ? (
            // Loaded state
            <div className={`grid grid-cols-2 md:grid-cols-6 gap-3 transition-opacity duration-300 ${previewLoading ? "opacity-50" : "opacity-100"}`}>
              <StatCard
                label="Current AQI"
                value={preview.currentAqi}
                sub={preview.currentCat}
                color={getCategoryColor(preview.currentCat)}
              />
              <StatCard
                label="Category"
                value={preview.currentCat}
                color={getCategoryColor(preview.currentCat)}
                textValue
              />
              <StatCard
                label="Forecast Peak"
                value={preview.forecastPeak}
                sub={preview.forecastPeakCat !== "--" ? preview.forecastPeakCat : ""}
                color={getCategoryColor(preview.forecastPeakCat)}
              />
              <StatCard
                label="Forecast Low"
                value={preview.forecastLow}
                color="#10B981"
              />
              <StatCard
                label="Trend"
                value={preview.trend}
                textValue
                color={
                  preview.trend.includes("↑") ? "#EF4444"
                    : preview.trend.includes("↓") ? "#10B981"
                      : "#6B7280"
                }
              />
              <StatCard
                label="Confidence"
                value={preview.confStr}
                textValue
                small
                color="#4F46E5"
              />
            </div>
          ) : (
            <div className="h-20 flex items-center text-sm text-secondary">
              No data available for {city}.
            </div>
          )}
        </div>

        {/* ── MAIN CARD ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 bg-[var(--card)] dark:bg-white/[0.04] backdrop-blur-md border border-[var(--card-border)] dark:border-white/[0.06] rounded-2xl shadow-xl overflow-hidden">

          {/* LEFT: Visual Preview */}
          <div className="md:col-span-5 bg-gradient-to-br from-indigo-500 to-purple-600 p-10 flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-black/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

            <div className="relative z-10 w-48 aspect-[1/1.414] bg-white rounded-lg shadow-2xl p-4 flex flex-col gap-3 transform transition-transform hover:scale-105 duration-500">
              <div className="h-2 w-1/2 bg-indigo-500 rounded-full opacity-20"></div>
              <div className="h-2 w-1/3 bg-gray-300 rounded-full mb-2"></div>
              <div className="flex-1 bg-indigo-50 rounded border border-indigo-100 flex items-end justify-between p-2 gap-1">
                <div className="w-1/5 h-[40%] bg-indigo-300 rounded-t"></div>
                <div className="w-1/5 h-[70%] bg-indigo-400 rounded-t"></div>
                <div className="w-1/5 h-[50%] bg-indigo-300 rounded-t"></div>
                <div className="w-1/5 h-[80%] bg-indigo-500 rounded-t"></div>
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 w-full bg-gray-200 rounded-full"></div>
                <div className="h-1.5 w-5/6 bg-gray-200 rounded-full"></div>
                <div className="h-1.5 w-4/6 bg-gray-200 rounded-full"></div>
              </div>
              <div className="absolute -right-3 -bottom-3 bg-white text-indigo-600 text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-indigo-100">
                PDF
              </div>
            </div>
          </div>

          {/* RIGHT: Configuration Controls */}
          <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-center">

            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary mb-2">Configure Report</h2>
              <p className="text-sm text-secondary leading-relaxed">
                Select the time range for your analysis. The generated report includes CPCB AQI breakdowns, 24-hour forecast, health advisory, and AI model metrics.
              </p>
            </div>

            {/* Duration Selector */}
            <div className="mb-8">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 block">
                Time Range
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[7, 14, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`
                      py-3 rounded-xl text-sm font-bold transition-all border
                      ${days === d
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-105 hover:cursor-pointer"
                        : "bg-[var(--bg)] text-secondary border-transparent hover:cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-white/5"}
                    `}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Tags */}
            <div className="mb-8 flex flex-wrap gap-3">
              <FeatureTag icon="📊" text="CPCB AQI Analysis" />
              <FeatureTag icon="🤖" text="AI Forecast" />
              <FeatureTag icon="🏥" text="Health Advisory" />
              <FeatureTag icon="📋" text="Data Appendix" />
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`
                w-full py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all
                ${downloading
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:cursor-pointer hover:from-indigo-500 hover:to-purple-500 text-white hover:shadow-indigo-500/25 active:scale-95"}
              `}
            >
              {downloading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Generating Report...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download PDF Report
                </>
              )}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

// ── HELPER COMPONENTS ──

function StatCard({ label, value, sub, color, textValue, small }) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg)] p-3 flex flex-col min-h-[80px]">
      <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
        {label}
      </span>
      <span
        className={`font-bold leading-tight mt-auto ${small ? "text-sm" : "text-base"}`}
        style={{ color: color || "var(--text)" }}
      >
        {value}
      </span>
      <span className="text-[10px] text-secondary mt-0.5 min-h-[14px]">
        {sub || "\u00A0"}
      </span>
    </div>
  );
}

function FeatureTag({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-xs font-bold text-secondary border border-gray-200 dark:border-white/10 select-none">
      <span>{icon}</span> {text}
    </span>
  );
}