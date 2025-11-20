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
import { getPredict } from "../lib/api";
import { fetchPredictionsCached } from "../utils/fetchPredictionsCached";
import { ThemeContext } from "../context/ThemeContext";

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

// 🔥 1. ADDED: The Centralized AQI Formula (Matches Live Cards)
function pm25ToAQI(pm25) {
  if (pm25 === null || pm25 === undefined || isNaN(parseFloat(pm25))) return 0;
  const pm = parseFloat(pm25);

  // Indian CPCB Breakpoints
  if (pm <= 30) return Math.round((50 / 30) * pm);
  if (pm <= 60) return Math.round(((100 - 51) / (60 - 30)) * (pm - 30) + 51);
  if (pm <= 90) return Math.round(((200 - 101) / (90 - 60)) * (pm - 60) + 101);
  if (pm <= 120) return Math.round(((300 - 201) / (120 - 90)) * (pm - 90) + 201);
  if (pm <= 250) return Math.round(((400 - 301) / (250 - 120)) * (pm - 120) + 301);
  if (pm > 250) return Math.round(((500 - 401) / (380 - 250)) * (pm - 250) + 401);
  
  return 500;
}

// 🔥 2. UPDATED: Category Logic based on AQI (not PM2.5)
function getAQICategoryText(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 200) return "Poor";
  if (aqi <= 300) return "Unhealthy";
  if (aqi <= 400) return "Severe";
  return "Hazardous";
}

function getAQICategoryColor(aqi) {
  if (aqi <= 50) return "#00E400";      // Green
  if (aqi <= 100) return "#F0D400";     // Yellow
  if (aqi <= 200) return "#F07554";     // Orange
  if (aqi <= 300) return "#F54E8E";     // Pink/Red
  if (aqi <= 400) return "#8F3F97";     // Purple
  return "#7E0023";                     // Maroon
}

export default function ForecastCard({ city, hours = 24 }) {
  const { theme } = useContext(ThemeContext);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [peakInfo, setPeakInfo] = useState({ value: 0, time: "--", color: "#ccc", category: "" });
  
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const data = await fetchPredictionsCached(city, () => getPredict(city, hours));
        
        if (data?.predictions?.length > 0) {
          
          // 1. Labels (Time)
          const labels = data.predictions.map((p) => {
            const dt = new Date(p.datetime);
            return dt.toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true,
            });
          });
          
          // 🔥 3. UPDATED: Convert PM2.5 -> AQI for the chart
          const values = data.predictions.map((p) => pm25ToAQI(p.pm25));

          // 3. Find Peak AQI
          const maxValue = Math.max(...values);
          const maxIndex = values.indexOf(maxValue);
          const maxTime = labels[maxIndex];
          const maxColor = getAQICategoryColor(maxValue);
          const maxCat = getAQICategoryText(maxValue);

          setPeakInfo({
            value: Math.round(maxValue),
            time: maxTime,
            color: maxColor,
            category: maxCat
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
                
                // Gradient Stroke based on AQI Severity colors
                borderColor: (context) => {
                  const chart = context.chart;
                  const { ctx, chartArea } = chart;
                  if (!chartArea) return "#6366f1";
                  
                  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                  // Colors mapped roughly to AQI scale height (0 to 500)
                  gradient.addColorStop(0, "#00E400");   // Good
                  gradient.addColorStop(0.2, "#F0D400"); // Moderate
                  gradient.addColorStop(0.4, "#F07554"); // Poor
                  gradient.addColorStop(0.6, "#F54E8E"); // Unhealthy
                  gradient.addColorStop(0.8, "#8F3F97"); // Severe
                  gradient.addColorStop(1, "#7E0023");   // Hazardous
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
        }
      } catch (err) {
        console.error("Forecast fetch error:", err);
      }
      setLoading(false);
    };

    if (city) {
      fetchPrediction();
    }
  }, [city, hours, theme]); 

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
          // 🔥 4. UPDATED Tooltip Label
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
        // Optional: Set min/max to keep chart stable if needed, or let it float
        min: 0,
      },
    },
  }), [theme, chartData]);

  // Loading Skeleton (Unchanged)
  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto mt-6 px-4 md:px-6 mb-10 relative z-10">
        <div className="h-[380px] rounded-3xl bg-[var(--card)] border border-[var(--card-border)] shadow-md p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent z-20"></div>
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-3">
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
            </div>
            <div className="hidden md:block">
               <div className="h-10 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            </div>
          </div>
          <div className="relative h-[250px] w-full bg-gray-50 dark:bg-gray-800/30 rounded-xl overflow-hidden flex items-end pb-4 px-4 gap-4">
             <div className="w-full h-[40%] bg-gray-200 dark:bg-gray-700/50 rounded-t-sm"></div>
             <div className="w-full h-[60%] bg-gray-200 dark:bg-gray-700/50 rounded-t-sm"></div>
             <div className="w-full h-[30%] bg-gray-200 dark:bg-gray-700/50 rounded-t-sm"></div>
             <div className="w-full h-[80%] bg-gray-200 dark:bg-gray-700/50 rounded-t-sm"></div>
             <div className="w-full h-[50%] bg-gray-200 dark:bg-gray-700/50 rounded-t-sm"></div>
             <div className="w-full h-[70%] bg-gray-200 dark:bg-gray-700/50 rounded-t-sm"></div>
             <div className="w-full h-[45%] bg-gray-200 dark:bg-gray-700/50 rounded-t-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto mt-6 px-4 md:px-6 mb-10 relative z-10">
      <div className="rounded-3xl p-6 md:p-8 shadow-lg bg-[var(--card)] border border-[var(--card-border)] transition-all duration-300">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
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

          {peakInfo.value > 0 && (
            <div className="flex items-center gap-3 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
              <div className="text-right">
                <p className="text-[15px] uppercase tracking-wider font-bold text-secondary">
                  Expected Peak AQI
                </p>
                <div className="flex items-center justify-end gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: peakInfo.color }}></span>
                    <p className="text-m font-bold text-primary">
                        {/* 🔥 5. UPDATED Unit to 'AQI' */}
                        {peakInfo.value} <span className="text-sm font-normal text-secondary">AQI</span>
                    </p>
                    <span className="text-sm text-secondary font-bold">
                        at {peakInfo.time}
                    </span>
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