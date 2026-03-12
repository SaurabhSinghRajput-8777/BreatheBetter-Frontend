// src/components/ForecastCard.jsx
import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import { Line } from "react-chartjs-2";
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
import { pm25ToAQI, getAQICategory, getAQIColor } from "../utils/aqiUtils";
import { ThemeContext } from "../context/ThemeContext";
import { TrendingUp, Sunrise, Shield, LineChart } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// AQI conversion and categorization imported from centralized aqiUtils.js
// Aliases for chart usage
const getAQICategoryText = getAQICategory;
const getAQICategoryColor = getAQIColor;

export default function ForecastCard({ city, hours = 24, predData = null }) {
  const { theme } = useContext(ThemeContext);
  const [chartData, setChartData] = useState(null);
  const loading = !predData;

  const [insights, setInsights] = useState(null);

  const chartRef = useRef(null);

  const TEXT_COLORS = {
    Good: "text-green-600 dark:text-green-400",
    Satisfactory: "text-lime-600 dark:text-lime-400",
    Moderate: "text-yellow-600 dark:text-yellow-400",
    Poor: "text-orange-600 dark:text-orange-500",
    "Very Poor": "text-red-600 dark:text-red-500",
    Severe: "text-purple-600 dark:text-purple-400",
  };

  // Process prediction data into chart format
  const processPredictions = (data) => {
    if (!data?.predictions?.length) return;

    const labels = data.predictions.map((p) => {
      const dt = new Date(p.datetime);
      return dt.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
    });

    const values = data.predictions.map((p) => pm25ToAQI(p.pm25));

    const maxValue = Math.max(...values);
    const maxIndex = values.indexOf(maxValue);
    const maxTime = labels[maxIndex];
    const maxCat = getAQICategoryText(maxValue);

    const minValue = Math.min(...values);
    const minIndex = values.indexOf(minValue);
    const minTime = labels[minIndex];

    setInsights({
      peakValue: Math.round(maxValue),
      peakTime: maxTime,
      peakColorClass: TEXT_COLORS[maxCat] || "text-gray-500",
      bestValue: Math.round(minValue),
      bestTime: minTime,
      maskReq: maxValue > 100
    });

    setChartData({
      labels: labels,
      datasets: [
        {
          label: "Forecast AQI",
          data: values,
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
          pointBorderWidth: 2,

          borderColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return "#6366f1";

            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, "#00E400");   // Good
            gradient.addColorStop(0.2, "#F0D400"); // Satisfactory
            gradient.addColorStop(0.4, "#F07554"); // Moderate
            gradient.addColorStop(0.6, "#F54E8E"); // Poor
            gradient.addColorStop(0.8, "#8F3F97"); // Very Poor
            gradient.addColorStop(1, "#7E0023");   // Severe
            return gradient;
          },

          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return "rgba(99, 102, 241, 0.2)";

            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, "rgba(0, 228, 0, 0.1)");
            gradient.addColorStop(1, "rgba(245, 78, 142, 0.4)");
            return gradient;
          },
        },
      ],
    });
  };

  useEffect(() => {
    if (predData) {
      processPredictions(predData);
    }
  }, [predData, theme]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme === "dark" ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
        titleColor: theme === "dark" ? "#f8fafc" : "#0f172a",
        bodyColor: theme === "dark" ? "#64748b" : "#475569",
        borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => `Time: ${tooltipItems[0].label}`,
          label: (context) => `AQI: ${context.parsed.y}`,
          afterLabel: (context) => {
            const val = context.parsed.y;
            const cat = getAQICategoryText(val);
            return `Status: ${cat}`;
          }
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: theme === "dark" ? "#64748b" : "#9ca3af", font: { size: 11 }, maxTicksLimit: 7 },
        border: { display: false },
      },
      y: {
        grid: { color: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)", borderDash: [5, 5] },
        ticks: { color: theme === "dark" ? "#64748b" : "#9ca3af", font: { size: 10 } },
        border: { display: false },
        min: 0,
      },
    },
  }), [theme, chartData]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mt-6 px-4 md:px-6 mb-10 relative z-10">
        <div className="rounded-2xl shadow-lg bg-[var(--card)] dark:bg-white/[0.04] backdrop-blur-md border border-[var(--card-border)] dark:border-white/[0.06] transition-all duration-300 overflow-hidden">
          
          <div className="flex items-center gap-4 bg-lime-50 dark:bg-lime-500/10 p-6 border-b border-lime-200 dark:border-lime-500/20">
            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700/50 animate-pulse shrink-0"></div>
            <div className="space-y-2">
               <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse"></div>
               <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="p-4 md:p-6 mb-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-[88px] rounded-xl bg-[var(--card)] dark:bg-white/5 border border-[var(--card-border)] dark:border-white/10 animate-pulse"></div>
              <div className="h-[88px] rounded-xl bg-[var(--card)] dark:bg-white/5 border border-[var(--card-border)] dark:border-white/10 animate-pulse"></div>
              <div className="h-[88px] rounded-xl bg-[var(--card)] dark:bg-white/5 border border-[var(--card-border)] dark:border-white/10 animate-pulse"></div>
            </div>
            
            <div className="relative h-[300px] w-full flex items-end pb-8 px-4 gap-2 border-b border-l border-gray-100 dark:border-gray-800">
               <div className="w-full h-[40%] bg-gray-200 dark:bg-gray-700/30 rounded-t-sm animate-pulse"></div>
               <div className="w-full h-[60%] bg-gray-200 dark:bg-gray-700/30 rounded-t-sm animate-pulse"></div>
               <div className="w-full h-[30%] bg-gray-200 dark:bg-gray-700/30 rounded-t-sm animate-pulse"></div>
               <div className="w-full h-[80%] bg-gray-200 dark:bg-gray-700/30 rounded-t-sm animate-pulse"></div>
               <div className="w-full h-[50%] bg-gray-200 dark:bg-gray-700/30 rounded-t-sm animate-pulse"></div>
               <div className="w-full h-[70%] bg-gray-200 dark:bg-gray-700/30 rounded-t-sm animate-pulse"></div>
               <div className="w-full h-[45%] bg-gray-200 dark:bg-gray-700/30 rounded-t-sm animate-pulse"></div>
               <div className="w-full h-[85%] bg-gray-200 dark:bg-gray-700/30 rounded-t-sm animate-pulse"></div>
               <div className="w-full h-[65%] bg-gray-200 dark:bg-gray-700/30 rounded-t-sm animate-pulse"></div>
               <div className="w-full h-[35%] bg-gray-200 dark:bg-gray-700/30 rounded-t-sm animate-pulse"></div>
               <div className="w-full h-[55%] bg-gray-200 dark:bg-gray-700/30 rounded-t-sm animate-pulse"></div>
               <div className="w-full h-[75%] bg-gray-200 dark:bg-gray-700/30 rounded-t-sm animate-pulse"></div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-6 px-4 md:px-6 mb-10 relative z-10">
      <div className="rounded-2xl shadow-lg bg-[var(--card)] dark:bg-white/[0.04] backdrop-blur-md border border-[var(--card-border)] dark:border-white/[0.06] transition-all duration-300 overflow-hidden">

        <div className="flex items-center gap-4 bg-lime-50 dark:bg-lime-500/10 p-6 border-b border-lime-200 dark:border-lime-500/20">
          <div className="p-3 rounded-xl bg-white dark:bg-black/20 shadow-sm text-lime-600 dark:text-lime-400">
            <LineChart className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary tracking-tight flex items-center gap-2">
              Hourly AQI Forecast
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                AI Based
              </span>
            </h2>
            <p className="text-sm text-secondary font-medium mt-1">
              Predicting next <span className="text-primary font-semibold">{hours} hours</span> of Air Quality Index
            </p>
          </div>
        </div>

        <div className="flex flex-col mb-8 gap-6 p-4 md:p-6 mb-0">
          {insights && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--card)] dark:bg-white/5 border border-[var(--card-border)] dark:border-white/10 shadow-sm transition-shadow hover:shadow-md">
                <div className={`p-3 rounded-lg bg-white dark:bg-black/20 shadow-sm ${insights.peakColorClass}`}>
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Expected Peak AQI</p>
                  <p className="text-lg font-bold text-primary">
                    <span className={insights.peakColorClass}>{insights.peakValue}</span> <span className="text-sm font-normal text-secondary">at {insights.peakTime}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--card)] dark:bg-white/5 border border-[var(--card-border)] dark:border-white/10 shadow-sm transition-shadow hover:shadow-md">
                <div className="p-3 rounded-lg bg-white dark:bg-black/20 shadow-sm text-emerald-500">
                  <Sunrise className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Best Time Outside</p>
                  <p className="text-lg font-bold text-primary">
                    {insights.bestTime} <span className="text-sm font-normal text-secondary">({insights.bestValue} AQI)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--card)] dark:bg-white/5 border border-[var(--card-border)] dark:border-white/10 shadow-sm transition-shadow hover:shadow-md">
                <div className={`p-3 rounded-lg bg-white dark:bg-black/20 shadow-sm ${insights.maskReq ? "text-amber-500" : "text-emerald-500"}`}>
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Mask Recommended</p>
                  <p className={`text-lg font-bold ${insights.maskReq ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {insights.maskReq ? "YES" : "NO"}
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>

        <div className="relative h-[300px] w-full">
          {chartData ? (
            <Line ref={chartRef} data={chartData} options={options} />
          ) : (
            <div className="flex h-full items-center justify-center text-secondary">
              No forecast data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}