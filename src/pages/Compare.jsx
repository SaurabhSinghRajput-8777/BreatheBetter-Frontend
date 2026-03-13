// src/pages/Compare.jsx
import React, { useState, useContext, useEffect, useRef } from "react";
import { getPredict, getHistory, getLivePollutants } from "../lib/api";
import { fetchHistoryCached } from "../utils/fetchHistoryCached";
import { fetchPredictCached } from "../utils/fetchPredictCached";
import { pm25ToAQI, getAQICategory, getAQIColor } from "../utils/aqiUtils";
import { fetchLiveAQI } from "../utils/fetchLiveAQI";
import { Line, Bar } from "react-chartjs-2";
import { ThemeContext } from "../context/ThemeContext";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  PointElement,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  PointElement,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

const CITIES = ["Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata"];

// ─────────────────────────────────────────────────────────────────────
// SHARED CHART OPTIONS BUILDER
// ─────────────────────────────────────────────────────────────────────
function buildChartOptions(theme, extraOpts = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme === "dark" ? "rgba(17,24,39,0.95)" : "rgba(255,255,255,0.95)",
        titleColor: theme === "dark" ? "#fff" : "#111827",
        bodyColor: theme === "dark" ? "#9ca3af" : "#4b5563",
        borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        filter: (item) =>
          !item.dataset.label?.includes("Upper") &&
          !item.dataset.label?.includes("Confidence"),
      },
    },
    scales: {
      x: { display: false },
      y: {
        grid: { color: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" },
        ticks: { color: theme === "dark" ? "#9ca3af" : "#6b7280", font: { size: 10 } },
      },
    },
    ...extraOpts,
  };
}

// ─────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────
export default function Compare() {
  const { theme, city: globalCity } = useContext(ThemeContext);

  // ── Mode toggle ───────────────────────────────────────────────────
  const [compareMode, setCompareMode] = useState("forecast"); // "forecast" | "city"

  // ── Shared city selectors ─────────────────────────────────────────
  const [forecastCity, setForecastCity] = useState(globalCity || "Delhi");
  const [cityA, setCityA] = useState("Delhi");
  const [cityB, setCityB] = useState("Mumbai");
  const [days, setDays] = useState(7);

  const chartOptions = buildChartOptions(theme);

  return (
    <div className="w-full min-h-screen bg-[--bg] transition-colors pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              City Comparison
            </h1>
            <p className="text-sm text-secondary mt-1 ml-1">Analyze air quality differences.</p>
          </div>

          {/* MODE TOGGLE */}
          <div className="flex items-center gap-1 p-1 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-sm">
            <button
              onClick={() => setCompareMode("forecast")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${compareMode === "forecast"
                ? "bg-indigo-500 text-white shadow-md"
                : "text-[var(--text-secondary)] hover:bg-gray-500/10"
                }`}
            >
              Past vs Forecast
            </button>
            <button
              onClick={() => setCompareMode("city")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${compareMode === "city"
                ? "bg-indigo-500 text-white shadow-md"
                : "text-[var(--text-secondary)] hover:bg-gray-500/10"
                }`}
            >
              City vs City
            </button>
          </div>
        </div>

        {/* RENDER ACTIVE MODE */}
        {compareMode === "forecast" ? (
          <ForecastComparison
            city={forecastCity}
            setCity={setForecastCity}
            theme={theme}
            chartOptions={chartOptions}
          />
        ) : (
          <CityComparison
            cityA={cityA}
            setCityA={setCityA}
            cityB={cityB}
            setCityB={setCityB}
            days={days}
            setDays={setDays}
            theme={theme}
            chartOptions={chartOptions}
          />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MODE 1 — FORECAST COMPARISON (Past 24h vs Next 24h, same city)
// ═══════════════════════════════════════════════════════════════════════

// AQI conversion imported from centralized aqiUtils.js
// Do NOT add local pm25ToAQI here.

function ForecastComparison({ city, setCity, theme, chartOptions }) {
  const [history, setHistory] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [confLow, setConfLow] = useState(null);
  const [confHigh, setConfHigh] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState(null);

  // local cache to avoid redundant network requests during same session
  const cityDataCache = useRef({});

  useEffect(() => {
    let cancelled = false;

    // ── LIVE AQI (Always fetch fresh) ───────────────────────────────
    (async () => {
      try {
        const live = await fetchLiveAQI(city);
        if (!cancelled) setLiveData(live);
      } catch (err) {
        console.error("[Compare] Live fetch failed:", err);
      }
    })();

    // ── CACHED CHART DATA (Intercept with Cache) ────────────────────
    const cachedData = cityDataCache.current[city];
    if (cachedData) {
      console.debug(`[Forecast] Cache Hit: ${city}`);
      setHistory(cachedData.history);
      setPredictions(cachedData.predictions);
      setConfLow(cachedData.confLow);
      setConfHigh(cachedData.confHigh);
      setLoading(false);
      return;
    }

    console.debug(`[Forecast] Cache Miss: ${city}. Fetching...`);
    setLoading(true);

    (async () => {
      try {
        const [histRes, predRes] = await Promise.allSettled([
          fetchHistoryCached(city, 1, () => getHistory(city, 1)),
          fetchPredictCached(city, () => getPredict(city)),
        ]);

        if (cancelled) return;

        const histData =
          histRes.status === "fulfilled" ? (histRes.value?.history || []).map((d) => d.pm25) : [];

        let predData = [];
        let cLow = null;
        let cHigh = null;
        if (predRes.status === "fulfilled" && predRes.value?.predictions?.length === 24) {
          predData = predRes.value.predictions.map((p) => p.pm25);
          cLow = predRes.value.confidence_low;
          cHigh = predRes.value.confidence_high;
        }

        cityDataCache.current[city] = {
          history: histData,
          predictions: predData,
          confLow: cLow,
          confHigh: cHigh
        };

        if (!cancelled) {
          setHistory(histData);
          setPredictions(predData);
          setConfLow(cLow);
          setConfHigh(cHigh);
        }
      } catch (err) {
        console.error("[Forecast] Fetch failed:", err);
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [city]);

  // ── Analytics (converted from PM2.5 → AQI) ───────────────────────
  const peakPm25 = predictions.length ? Math.max(...predictions) : null;
  const lowestPm25 = predictions.length ? Math.min(...predictions) : null;
  const currentPm25 = history.length ? history[history.length - 1] : null;

  const peak = peakPm25 != null ? pm25ToAQI(peakPm25) : null;
  const lowest = lowestPm25 != null ? pm25ToAQI(lowestPm25) : null;
  
  // Use Fresh Live data for the Current AQI card, fallback to history if not yet loaded
  const currentValue = liveData?.aqi || (currentPm25 != null ? pm25ToAQI(currentPm25) : null);

  const firstPredAqi = predictions.length ? pm25ToAQI(predictions[0]) : null;
  const delta =
    firstPredAqi != null && currentValue != null ? Math.round(firstPredAqi - currentValue) : null;

  console.debug("[Forecast] Current PM2.5:", currentPm25, "→ AQI:", currentValue);
  console.debug("[Forecast] Peak PM2.5:", peakPm25, "→ AQI:", peak);

  const trend = (() => {
    if (delta === null) return "—";
    if (delta > 5) return "Rising ↑";
    if (delta < -5) return "Falling ↓";
    return "Stable →";
  })();

  console.debug("[Forecast] delta:", delta, "trend:", trend);

  // ── Chart ─────────────────────────────────────────────────────────
  // Overlay both on same 24-point scale for cleaner comparison
  const chartLabels = Array.from({ length: 24 }, (_, i) => {
    const h = (i + 1) % 24;
    return `${h === 0 ? 12 : h > 12 ? h - 12 : h}${h >= 12 ? "pm" : "am"}`;
  });

  // Trim or pad history to last 24 points
  const hist24 = history.length >= 24 ? history.slice(-24) : history;
  const histPadded =
    hist24.length < 24
      ? [...Array(24 - hist24.length).fill(null), ...hist24]
      : hist24;

  const datasets = [];

  // Confidence upper (invisible anchor)
  if (confHigh != null) {
    datasets.push({
      label: "Upper",
      data: Array(24).fill(confHigh),
      borderColor: "transparent",
      backgroundColor: "transparent",
      pointRadius: 0,
      fill: false,
      order: 5,
    });
  }

  // Confidence lower (fill to upper)
  if (confLow != null && confHigh != null) {
    datasets.push({
      label: "Confidence",
      data: Array(24).fill(confLow),
      borderColor: "transparent",
      backgroundColor:
        theme === "dark" ? "rgba(234,179,8,0.08)" : "rgba(234,179,8,0.12)",
      pointRadius: 0,
      fill: "-1",
      order: 4,
    });
  }

  // Historical (blue)
  datasets.push({
    label: "Past 24h",
    data: histPadded,
    borderColor: "#6366f1",
    backgroundColor: "rgba(99,102,241,0.08)",
    borderWidth: 2.5,
    tension: 0.4,
    pointRadius: 0,
    pointHoverRadius: 5,
    fill: true,
    order: 2,
  });

  // Forecast (gold)
  if (predictions.length === 24) {
    datasets.push({
      label: "Forecast 24h",
      data: predictions,
      borderColor: "#eab308",
      backgroundColor: "rgba(234,179,8,0.08)",
      borderWidth: 2.5,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 5,
      fill: true,
      order: 1,
    });
  }

  const trendColor = delta > 5 ? "text-red-500" : delta < -5 ? "text-green-500" : "text-gray-500";

  return (
    <>
      {/* CITY SELECTOR */}
      <div className="flex items-center gap-4 mb-6 p-2 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl shadow-sm w-fit">
        <CitySelect value={city} onChange={setCity} color="text-indigo-500" />
      </div>

      {/* ANALYTICS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Current AQI", value: currentValue, color: "text-indigo-500" },
          { label: "Forecast Peak", value: peak, color: "text-amber-500" },
          { label: "Forecast Low", value: lowest, color: "text-emerald-500" },
          { label: "Delta", value: delta != null ? `${delta > 0 ? "+" : ""}${delta}` : null, color: trendColor },
          { label: "Trend", value: trend, color: trendColor },
        ].map((item) => (
          <div key={item.label} className="p-3 rounded-xl bg-[var(--card)] dark:bg-white/[0.04] backdrop-blur-md border border-[var(--card-border)] dark:border-white/[0.06]">
            <div className="text-xs font-medium text-[var(--text-secondary)] mb-1">{item.label}</div>
            <div className={`text-lg font-bold ${item.color}`}>
              {loading ? "..." : item.value ?? "—"}
            </div>
          </div>
        ))}
      </div>

      {/* FORECAST CHART */}
      <div className="p-6 rounded-2xl bg-[var(--card)] dark:bg-white/[0.04] backdrop-blur-md border border-[var(--card-border)] dark:border-white/[0.06] shadow-md mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-primary">Past 24h vs Forecast</h3>
          <div className="flex gap-4 text-xs font-bold">
            <span className="flex items-center gap-1 text-indigo-500">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Past
            </span>
            <span className="flex items-center gap-1 text-amber-500">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div> Forecast
            </span>
            {confLow != null && (
              <span className="flex items-center gap-1 text-yellow-600/60">
                <div className="w-2 h-2 rounded-full bg-yellow-400/40"></div> Confidence
              </span>
            )}
          </div>
        </div>
        <div className="w-full h-[300px]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-secondary animate-pulse">Loading...</div>
          ) : datasets.length <= 2 && predictions.length === 0 ? (
            <div className="h-full flex items-center justify-center text-secondary">
              No forecast data available yet for {city}.
            </div>
          ) : (
            <Line data={{ labels: chartLabels, datasets }} options={chartOptions} />
          )}
        </div>
      </div>

      {/* QUICK SUMMARY CARD */}
      {!loading && predictions.length > 0 && currentValue != null && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-amber-500 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">
                24h Outlook — {city}
              </p>
              <h2 className="text-2xl font-extrabold">
                {trend === "Rising ↑"
                  ? "Air quality is expected to worsen"
                  : trend === "Falling ↓"
                    ? "Air quality is expected to improve"
                    : "Air quality remains stable"}
              </h2>
            </div>
            <div className="text-4xl">
              {trend === "Rising ↑" ? "📈" : trend === "Falling ↓" ? "📉" : "➡️"}
            </div>
          </div>
          <p className="text-sm text-white/80 mt-2">
            Currently at <strong>{currentValue} AQI</strong>. Forecast peaks at{" "}
            <strong>{peak} AQI</strong> and dips to <strong>{lowest} AQI</strong> in the next 24 hours.
          </p>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MODE 2 — CITY VS CITY (preserved from previous implementation)
// ═══════════════════════════════════════════════════════════════════════
function CityComparison({ cityA, setCityA, cityB, setCityB, days, setDays, theme, chartOptions }) {
  const [dataA, setDataA] = useState([]);
  const [dataB, setDataB] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [avgA, setAvgA] = useState(0);
  const [avgB, setAvgB] = useState(0);

  // Local cache to store already fetched comparison data
  const cityComparisonCache = useRef({});

  useEffect(() => {
    const cacheKey = `${cityA}_${cityB}_${days}`;
    const invertKey = `${cityB}_${cityA}_${days}`;

    // 1. Intercept with Cache Check
    const cachedData = cityComparisonCache.current[cacheKey] || cityComparisonCache.current[invertKey];
    if (cachedData) {
      console.debug(`[CityComp] Cache Hit: ${cacheKey}`);
      // If result was stored with A and B inverted, swap them back
      const reversed = cityComparisonCache.current[invertKey] && !cityComparisonCache.current[cacheKey];
      
      setLabels(cachedData.labels);
      setDataA(reversed ? cachedData.dataB : cachedData.dataA);
      setDataB(reversed ? cachedData.dataA : cachedData.dataB);
      setAvgA(reversed ? cachedData.avgB : cachedData.avgA);
      setAvgB(reversed ? cachedData.avgA : cachedData.avgB);
      setLoading(false);
      return;
    }

    async function fetchData() {
      console.debug(`[CityComp] Cache Miss: ${cacheKey}. Fetching...`);
      setLoading(true);
      try {
        const [resA, resB] = await Promise.all([
          fetchHistoryCached(cityA, days, () => getHistory(cityA, days)),
          fetchHistoryCached(cityB, days, () => getHistory(cityB, days)),
        ]);

        const process = (res) => (res?.history || []).map((d) => d.pm25);
        const dates = (resA?.history || []).map((d) =>
          new Date(d.datetime).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
          })
        );

        const valsA = process(resA);
        const valsB = process(resB);

        setLabels(dates);
        setDataA(valsA);
        setDataB(valsB);

        const currentAvgA = getAvg(valsA);
        const currentAvgB = getAvg(valsB);

        setAvgA(currentAvgA);
        setAvgB(currentAvgB);

        // Store in Local Cache
        cityComparisonCache.current[cacheKey] = {
          labels: dates,
          dataA: valsA,
          dataB: valsB,
          avgA: currentAvgA,
          avgB: currentAvgB
        };

      } catch (err) {
        console.error("Comparison failed", err);
      }
      setLoading(false);
    }
    fetchData();
  }, [cityA, cityB, days]);

  const lineChartData = {
    labels,
    datasets: [
      {
        label: cityA,
        data: dataA,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        label: cityB,
        data: dataB,
        borderColor: "#ec4899",
        backgroundColor: "rgba(236,72,153,0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  };

  const barChartData = {
    labels: ["Average PM2.5"],
    datasets: [
      { label: cityA, data: [avgA], backgroundColor: "#6366f1", borderRadius: 8, barPercentage: 0.5 },
      { label: cityB, data: [avgB], backgroundColor: "#ec4899", borderRadius: 8, barPercentage: 0.5 },
    ],
  };

  return (
    <>
      {/* CONTROLS */}
      <div className="flex items-center gap-4 p-2 mb-6 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl shadow-sm w-fit">
        <CitySelect value={cityA} onChange={setCityA} color="text-indigo-500" />
        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-black text-gray-600 dark:text-gray-300">
          VS
        </div>
        <CitySelect value={cityB} onChange={setCityB} color="text-pink-500" />
        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2"></div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="bg-transparent text-sm font-bold text-primary outline-none cursor-pointer"
        >
          <option value={1}>24 Hours</option>
          <option value={3}>3 Days</option>
          <option value={7}>7 Days</option>
          <option value={30}>30 Days</option>
        </select>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Cleaner City */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Cleaner City</p>
              <h2 className="text-3xl font-extrabold tracking-tight">
                {loading ? "..." : avgA < avgB ? cityA : cityB}
              </h2>
            </div>
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center text-xl backdrop-blur-sm">
              🏆
            </div>
          </div>
          <p className="text-xs text-indigo-100 opacity-90 font-medium">
            Maintains better air quality on average over the last {days} days.
          </p>
        </div>

        {/* Gap Analysis */}
        <div className="p-6 rounded-2xl bg-[var(--card)] dark:bg-white/[0.04] backdrop-blur-md border border-[var(--card-border)] dark:border-white/[0.06] shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Pollution Gap</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-extrabold text-primary">
                  {loading ? "..." : `${Math.abs(Math.round(avgA - avgB))}`}
                </h2>
                <span className="text-sm font-medium text-secondary">µg/m³ difference</span>
              </div>
            </div>
            <div className="flex gap-1 h-8 items-end">
              <div className="w-2 bg-indigo-500 rounded-t-sm" style={{ height: "60%" }}></div>
              <div className="w-2 bg-pink-500 rounded-t-sm" style={{ height: "100%" }}></div>
            </div>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mt-auto overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-pink-500"
              style={{ width: `${(Math.min(avgA, avgB) / Math.max(avgA, avgB, 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend */}
        <div className="p-6 rounded-2xl bg-[var(--card)] dark:bg-white/[0.04] backdrop-blur-md border border-[var(--card-border)] dark:border-white/[0.06] shadow-md h-[350px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-primary">Historical Trend</h3>
            <div className="flex gap-4 text-xs font-bold">
              <span className="flex items-center gap-1 text-indigo-500">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div> {cityA}
              </span>
              <span className="flex items-center gap-1 text-pink-500">
                <div className="w-2 h-2 rounded-full bg-pink-500"></div> {cityB}
              </span>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            {loading ? (
              <div className="h-full flex items-center justify-center text-secondary animate-pulse">
                Loading Trend Data...
              </div>
            ) : (
              <Line data={lineChartData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Average Bar */}
        <div className="p-6 rounded-2xl bg-[var(--card)] dark:bg-white/[0.04] backdrop-blur-md border border-[var(--card-border)] dark:border-white/[0.06] shadow-md h-[350px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-primary">Average PM2.5</h3>
            <span className="text-xs font-bold text-secondary bg-gray-100 dark:bg-gray-400 px-2 py-1 rounded">
              Lower is Better
            </span>
          </div>
          <div className="flex-1 w-full min-h-0">
            {loading ? (
              <div className="h-full flex items-center justify-center text-secondary animate-pulse">
                Calculating...
              </div>
            ) : (
              <Bar
                data={barChartData}
                options={{
                  ...chartOptions,
                  scales: { x: { display: false }, y: { display: false } },
                }}
              />
            )}
          </div>
          <div className="mt-2 flex justify-around text-center border-t border-[var(--card-border)] pt-4">
            <div>
              <span className="block text-2xl font-bold text-indigo-500">{Math.round(avgA)}</span>
              <span className="text-xs font-bold text-secondary uppercase">{cityA}</span>
            </div>
            <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
            <div>
              <span className="block text-2xl font-bold text-pink-500">{Math.round(avgB)}</span>
              <span className="text-xs font-bold text-secondary uppercase">{cityB}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Utility to calculate average of a numeric array.
 * @param {number[]} arr
 * @returns {number}
 */
const getAvg = (arr) => arr.length > 0 ? arr.reduce((acc, val) => acc + val, 0) / arr.length : 0;

function CitySelect({ value, onChange, color }) {
  return (
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none bg-transparent pl-3 pr-8 py-2 font-bold cursor-pointer outline-none ${color} hover:opacity-80 transition-opacity`}
      >
        {CITIES.map((c) => (
          <option key={c} value={c} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
            {c}
          </option>
        ))}
      </select>
      <div className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${color}`}>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}