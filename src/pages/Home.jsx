// src/pages/Home.jsx
import React, { useEffect, useState, useContext } from "react";
import Heatmap from "../components/Heatmap";
import MainPredictionCard from "../components/MainPredictionCard";
import RealtimeAQICard from "../components/RealtimeAQICard";
import PollutantCard from "../components/PollutantCard";
import ForecastCard from "../components/ForecastCard";
import HealthRecommendationCard from "../components/HealthRecommendationCard"; 
import { ThemeContext } from "../context/ThemeContext";
import { getLivePollutants, getPredict } from "../lib/api"; // 🔥 Removed getCurrentAQI
import { fetchPredictionsCached } from "../utils/fetchPredictionsCached";
import { fetchPollutantsCached } from "../utils/fetchPollutantsCached";

export default function Home() {
  const { city } = useContext(ThemeContext);

  // 🔥 FIX 1: Removed separate 'currentAqi' state. 
  // We will use 'pollutantsData' (Source: OpenWeatherMap) for everything.
  const [predictionData, setPredictionData] = useState(null);
  const [pollutantsData, setPollutantsData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [pollutantsLoading, setPollutantsLoading] = useState(true);

  // Helper to fetch pollutants
  const loadPollutants = async () => {
    try {
      // Fetches from /live_pollutants (Same endpoint as RealtimeAQICard)
      const pollData = await fetchPollutantsCached(city, () => getLivePollutants(city));
      setPollutantsData(pollData);
    } catch (err) {
      console.warn("Pollutants backend offline:", err);
    }
    setPollutantsLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    setPollutantsLoading(true);

    // 1. Fetch Predictions
    (async () => {
      let predictions = null;
      try {
        predictions = await fetchPredictionsCached(city, () => getPredict(city, 24));
      } catch (err) {
        console.warn("Predictions backend offline → using last known data");
        predictions = predictionData;
      }
      setPredictionData(predictions);
      setLoading(false);
    })();

    // 2. Fetch Live Pollutants
    loadPollutants();

    // Refresh every minute
    const interval = setInterval(() => {
      loadPollutants();
    }, 60000);

    return () => clearInterval(interval);

  }, [city]);

  const pollutants = [
    // 🔥 FIX 2: Use pollutantsData for PM2.5 too
    ["PM2.5", pollutantsData?.pm25, "µg/m³"], 
    ["PM10", pollutantsData?.pm10, "µg/m³"],
    ["NO2", pollutantsData?.no2, "ppb"],
    ["SO2", pollutantsData?.so2, "ppb"],
    ["O3", pollutantsData?.o3, "ppb"],
    ["CO", pollutantsData?.co, "ppb"],
  ];

  return (
    <div className="min-h-screen bg-[--bg] transition-colors">

      <Heatmap />

      {/* 🔥 FIX 3: Pass pollutantsData as liveAqiData. 
          MainPredictionCard handles the calculation of AQI/Category locally. */}
      <MainPredictionCard
        liveAqiData={pollutantsData}
        predData={predictionData}
        loading={loading || pollutantsLoading}
      />

      <div className="max-w-[1200px] mx-auto mt-6 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

          <RealtimeAQICard city={city} />

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pollutants.map(([name, val, unit]) => (
              <PollutantCard
                key={name}
                name={name}
                value={val}
                unit={unit}
                loading={pollutantsLoading}
              />
            ))}
          </div>

        </div>
      </div>

      {/* Use the same data source for health recommendations too */}
      <HealthRecommendationCard pm25={pollutantsData?.pm25} />

      <ForecastCard city={city} hours={24} />

    </div>
  );
}