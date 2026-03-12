// src/pages/History.jsx
import React, { useState, useEffect, useContext } from "react";
import { Line } from "react-chartjs-2";
import { ThemeContext } from "../context/ThemeContext";
import { getHistory } from "../lib/api";
import { fetchHistoryCached } from "../utils/fetchHistoryCached"; // 🔥 Import Cache Utility
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { History as HistoryIcon } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// ── Helpers ──
function buildChartOptions(theme) {
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
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        grid: { color: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" },
        ticks: { color: theme === "dark" ? "#9ca3af" : "#6b7280", font: { size: 10 } },
      },
    },
  };
}

export default function History() {
  const { theme, city } = useContext(ThemeContext);
  const [timeRange, setTimeRange] = useState(7); // Days as number
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── FETCH DATA ──
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetchHistoryCached(city, timeRange, () => getHistory(city, timeRange));
        if (!cancelled && res && res.history) {
          setHistoryData(res.history);
        }
      } catch (err) {
        console.error("History fetch failed", err);
      }
      if (!cancelled) setLoading(false);
    }
    fetchData();
    return () => { cancelled = true; };
  }, [city, timeRange]);

  const vals = historyData.map(d => d.pm25);
  const average = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  const max = vals.length ? Math.max(...vals) : 0;
  const min = vals.length ? Math.min(...vals) : 0;

  const chartOptions = buildChartOptions(theme);

  const chartData = {
    labels: historyData.map(d => new Date(d.datetime).toLocaleDateString("en-US", {
      month: 'short', day: 'numeric', hour: 'numeric'
    })),
    datasets: [{
      label: 'PM2.5',
      data: vals,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 5,
      borderWidth: 2.5,
    }]
  };

  return (
    <div className="w-full min-h-screen bg-[--bg] transition-colors pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl text-indigo-500 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
                <HistoryIcon className="w-6 h-6" />
              </div>
              Historical Insights
            </h1>
            <p className="text-sm text-secondary mt-2 ml-1">
              Analyze real-time recorded air quality trends for <span className="font-bold text-primary">{city}</span>.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-sm">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setTimeRange(d)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-semibold transition-all
                  ${timeRange === d
                    ? "bg-indigo-500 text-white shadow-md"
                    : "text-[var(--text-secondary)] hover:bg-gray-500/10 hover:cursor-pointer"}
                `}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Average" value={average} unit="µg/m³" color="text-indigo-500" />
          <StatCard label="Lowest" value={min} unit="µg/m³" color="text-emerald-500" />
          <StatCard label="Highest" value={max} unit="µg/m³" color="text-rose-500" />
        </div>

        {/* Main Chart */}
        <div className="p-6 rounded-2xl bg-[var(--card)] dark:bg-white/[0.04] backdrop-blur-md border border-[var(--card-border)] dark:border-white/[0.06] shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-primary">Pollution Trend</h3>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider bg-gray-100 dark:bg-white/5 px-2 py-1 rounded border border-[var(--card-border)]">
              PM2.5 Over Time
            </span>
          </div>
          <div className="h-[400px] w-full">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center text-secondary animate-pulse">Loading History...</div>
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, unit, color }) {
  return (
    <div className="p-6 rounded-2xl bg-[var(--card)] dark:bg-white/[0.04] backdrop-blur-md border border-[var(--card-border)] dark:border-white/[0.06] shadow-sm flex flex-col items-center">
      <span className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">{label}</span>
      <div className={`text-4xl font-extrabold ${color} flex items-baseline gap-1`}>
        {value}
        <span className="text-xs text-secondary font-medium tracking-normal">{unit}</span>
      </div>
    </div>
  );
}