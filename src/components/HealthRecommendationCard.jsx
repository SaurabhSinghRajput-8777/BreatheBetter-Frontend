// src/components/HealthRecommendationCard.jsx
import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { pm25ToAQI, getAQICategory } from "../utils/aqiUtils";
import { Shield, AlertTriangle, Wind, Activity, HeartPulse } from "lucide-react";

// AQI conversion and categorization imported from centralized aqiUtils.js
// Do NOT add local pm25ToAQI or getAQICategory here.

const healthAdvice = {
  Good: {
    title: "Air quality is excellent",
    tips: [
      "Outdoor activities are completely safe",
      "Ideal time to open your windows"
    ],
    color: "emerald"
  },
  Satisfactory: {
    title: "Air quality is acceptable",
    tips: [
      "Light outdoor activity is safe",
      "Sensitive individuals should monitor symptoms"
    ],
    color: "lime"
  },
  Moderate: {
    title: "Air quality may affect sensitive people",
    tips: [
      "Reduce prolonged outdoor exertion",
      "Children and elderly should limit exposure",
      "Close windows if hazy",
      "Use mask in highly polluted areas"
    ],
    color: "amber"
  },
  Poor: {
    title: "Air quality is unhealthy",
    tips: [
      "Avoid outdoor exercise entirely",
      "Wear N95 mask outdoors",
      "Keep indoor windows closed",
      "Run indoor air purification if possible"
    ],
    color: "orange"
  },
  "Very Poor": {
    title: "Air quality is very unhealthy",
    tips: [
      "Stay indoors as much as possible",
      "Avoid all outdoor activity",
      "Seal windows and gaps",
      "Use air purifier continuously"
    ],
    color: "red"
  },
  Severe: {
    title: "Hazardous air quality",
    tips: [
      "Strictly avoid going outside",
      "Keep all windows sealed",
      "Use N95 mask if exposure unavoidable",
      "Monitor vulnerable individuals closely"
    ],
    color: "purple"
  }
};

const COLOR_MAP = {
  emerald: {
    text: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/20"
  },
  lime: {
    text: "text-lime-600 dark:text-lime-400",
    bgLight: "bg-lime-50 dark:bg-lime-500/10",
    border: "border-lime-200 dark:border-lime-500/20"
  },
  amber: {
    text: "text-amber-600 dark:text-amber-500",
    bgLight: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/20"
  },
  orange: {
    text: "text-orange-600 dark:text-orange-500",
    bgLight: "bg-orange-50 dark:bg-orange-500/10",
    border: "border-orange-200 dark:border-orange-500/20"
  },
  red: {
    text: "text-red-600 dark:text-red-500",
    bgLight: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/20"
  },
  purple: {
    text: "text-purple-600 dark:text-purple-400",
    bgLight: "bg-purple-50 dark:bg-purple-500/10",
    border: "border-purple-200 dark:border-purple-500/20"
  }
};

function getTipIcon(tip, colorScheme) {
  const text = tip.toLowerCase();
  const IconProps = { className: `w-5 h-5 shrink-0 ${colorScheme.text}` };

  if (text.includes("mask")) return <Shield {...IconProps} />;
  if (text.includes("exercise") || text.includes("activity") || text.includes("exertion")) return <Activity {...IconProps} />;
  if (text.includes("window") || text.includes("air") || text.includes("indoors")) return <Wind {...IconProps} />;
  if (text.includes("monitor") || text.includes("symptoms") || text.includes("vulnerable")) return <HeartPulse {...IconProps} />;
  if (text.includes("avoid") || text.includes("limit") || text.includes("seal")) return <AlertTriangle {...IconProps} />;

  return <Shield {...IconProps} />;
}

export default function HealthRecommendationCard({ pm25 }) {
  const { theme } = useContext(ThemeContext);

  const aqi = pm25ToAQI(pm25);
  const category = getAQICategory(aqi);

  // Fallback to Moderate if unknown
  const advice = healthAdvice[category] || healthAdvice["Moderate"];
  const colorScheme = COLOR_MAP[advice.color];

  const innerCardClass = theme === 'dark'
    ? "bg-white/5 border-white/10 hover:bg-white/10"
    : "bg-gray-50 border-gray-100 hover:bg-gray-100";

  if (!pm25) return null;

  return (
    <div className="max-w-7xl mx-auto mt-6 px-4 md:px-6 mb-8">
      <div
        className="
          bg-[var(--card)] dark:bg-white/[0.04] backdrop-blur-md
          border border-[var(--card-border)] dark:border-white/[0.06]
          rounded-2xl shadow-lg overflow-hidden
          transition-all duration-300
        "
      >
        {/* Soft Gradient Header Section */}
        <div className={`flex items-center justify-between p-6 ${colorScheme.bgLight} border-b ${colorScheme.border}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-white dark:bg-black/20 shadow-sm ${colorScheme.text}`}>
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary tracking-tight">Health Guide</h2>
              <p className="text-sm text-secondary font-medium mt-1">
                Safety measures for <span className={`font-bold ${colorScheme.text}`}>{category}</span> air quality
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Advice Display */}
        <div className="flex flex-col gap-4 p-6">
          <h3 className="text-lg font-bold text-primary opacity-90 mb-2">{advice.title}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advice.tips.map((tip, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-4 rounded-xl border ${innerCardClass} transition-all duration-200 cursor-default`}
              >
                {getTipIcon(tip, colorScheme)}
                <span className="text-sm font-semibold text-primary">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}