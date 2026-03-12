// src/components/RealtimeAQICard.jsx
import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { getAQIColor, pm25ToAQI, getAQICategory } from "../utils/aqiUtils";

// Use backend-provided AQI directly when available; fallback to local conversion
function getStatusColor(aqi) {
  return getAQIColor(aqi);
}

function getGradientTargetColor(aqi) {
  if (aqi <= 50) return "#69FF69";
  if (aqi <= 100) return "#A8E86C";
  if (aqi <= 200) return "#FFFF4A";
  if (aqi <= 300) return "#FC896A";
  if (aqi <= 400) return "#AB4BB4";
  return "#A3002E";
}

export default function RealtimeAQICard({ city = "Delhi", externalData = null }) {
  const { theme } = useContext(ThemeContext);
  const data = externalData;
  const loading = !externalData;

  // 1. Loading State
  if (loading) {
    return (
      <div className="flex flex-col justify-between h-full relative overflow-hidden rounded-2xl bg-[var(--card)] border border-[var(--card-border)] shadow-md p-4 md:p-6 transition-all w-full min-h-[300px]">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start mb-4 z-10 w-full">
          <div>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700/50 rounded mb-1 animate-pulse"></div>
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse"></div>
          </div>
          <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700/50 rounded-full animate-pulse"></div>
        </div>

        {/* Central Gauge Skeleton */}
        <div className="flex flex-col items-center justify-center relative z-10 py-2 md:py-4 flex-1">
          <div className="w-[180px] h-[180px] rounded-full border-[10px] border-gray-200 dark:border-gray-700/50 animate-pulse flex items-center justify-center flex-col gap-2">
             <div className="h-10 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
             <div className="h-3 w-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
          <div className="mt-4 h-6 w-24 bg-gray-200 dark:bg-gray-700/50 rounded-full animate-pulse"></div>
        </div>

        {/* Footer Skeleton */}
        <div className="mt-auto text-center border-t border-[var(--card-border)] pt-2 md:pt-3 z-10 w-full flex justify-center">
          <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Use backend-provided AQI if available; fallback to local CPCB conversion
  // Note: pm25ToAQI and getAQICategory are no longer imported here,
  // assuming externalData provides 'aqi' and 'category' directly or
  // that the parent component handles the conversion if needed.
  // For this refactor, we assume `data.aqi` and `data.category` are available.
  // Use backend-provided AQI if available; fallback to local CPCB conversion
  const aqi = data?.aqi ?? (data?.pm25 != null ? pm25ToAQI(data.pm25) : 0);
  const category = data?.category ?? (aqi > 0 ? getAQICategory(aqi) : "Unknown");

  const datetime = data?.datetime
    ? new Date(data.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "--:--";

  const ringColor = getStatusColor(aqi);
  const gradientBottom = getGradientTargetColor(aqi);

  const radius = 90;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(aqi, 500) / 500) * circumference;

  return (
    <div
      className="flex flex-col justify-between h-full relative overflow-hidden rounded-2xl bg-[var(--card)] border border-[var(--card-border)] shadow-md p-4 md:p-6 transition-all w-full"
      style={{
        background: `linear-gradient(to bottom, var(--card) 30%, ${gradientBottom}2A 150%)`
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4 z-10 w-full">
        <div>
          <h2 className="text-lg font-bold text-primary">Live AQI Monitor</h2>
          <p className="text-xs text-secondary uppercase tracking-wider font-semibold">
            {city} Station
          </p>
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span className="text-[10px] font-bold text-red-600 uppercase">Live</span>
        </div>
      </div>

      {/* Central Gauge */}
      <div className="flex flex-col items-center justify-center relative z-10 py-2 md:py-4">
        <div className="relative flex items-center justify-center">
          <svg
            height={radius * 2.5}
            width={radius * 2.5}
            className="transform -rotate-90 transition-all duration-1000 ease-out"
          >
            <circle
              stroke="currentColor"
              strokeWidth={stroke}
              fill="transparent"
              r={normalizedRadius}
              cx={radius * 1.25}
              cy={radius * 1.25}
              className="text-gray-400 dark:text-gray-400 opacity-20"
            />
            <circle
              stroke={ringColor}
              strokeWidth={stroke}
              strokeDasharray={circumference + " " + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              fill="transparent"
              r={normalizedRadius}
              cx={radius * 1.25}
              cy={radius * 1.25}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`font-extrabold text-primary transition-all ${String(aqi).length > 3 ? "text-3xl" : "text-4xl"}`}
            >
              {loading ? "..." : aqi}
            </span>
            <span className="text-xs font-medium text-secondary">AQI</span>
          </div>
        </div>

        <div
          className="mt-4 px-4 py-1 rounded-full text-sm font-bold border shadow-sm backdrop-blur-sm"
          style={{
            borderColor: ringColor,
            backgroundColor: `${ringColor}20`,
            color: ringColor
          }}
        >
          {category}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center border-t border-[var(--card-border)] pt-2 md:pt-3 z-10 w-full">
        <p className="text-xs text-secondary">
          Last updated: <span className="font-medium text-primary">{datetime}</span>
        </p>
      </div>
    </div >
  );
}