// src/pages/Home.jsx
import React, { useEffect, useState, useContext, useRef } from "react";
import Heatmap from "../components/Heatmap";
import MainPredictionCard from "../components/MainPredictionCard";
import RealtimeAQICard from "../components/RealtimeAQICard";
import PollutantCard from "../components/PollutantCard";
import ForecastCard from "../components/ForecastCard";
import HealthRecommendationCard from "../components/HealthRecommendationCard";
import { ThemeContext } from "../context/ThemeContext";
import { getLivePollutants, getPredict } from "../lib/api";
import { useUser } from "@clerk/clerk-react";

import { fetchPollutantsCached } from "../utils/fetchPollutantsCached";
import { fetchPredictCached } from "../utils/fetchPredictCached";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Home() {
  const { city, setCity } = useContext(ThemeContext);
  const { isSignedIn, user } = useUser();
  const profileFetched = useRef(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isSignedIn || !user || profileFetched.current) return;
    profileFetched.current = true;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/profile?clerk_user_id=${encodeURIComponent(user.id)}`);
        const data = await res.json();
        if (data.profile?.preferred_city && data.profile.preferred_city !== city) {
          console.log(`[Dashboard] Switching to user's preferred city: ${data.profile.preferred_city}`);
          setCity(data.profile.preferred_city);
        }
      } catch (err) {
        console.warn("[Dashboard] Could not load user profile:", err);
      }
    })();
  }, [isSignedIn, user, city, setCity]);

  const [predictionData, setPredictionData] = useState(null);
  const [pollutantsData, setPollutantsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollutantsLoading, setPollutantsLoading] = useState(true);

  const loadPollutants = async () => {
    try {
      const pollData = await fetchPollutantsCached(city, () => getLivePollutants(city));
      setPollutantsData(pollData);
    } catch (err) {
      console.warn("Pollutants backend offline:", err);
    }
    setPollutantsLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const predictions = await fetchPredictCached(city, () => getPredict(city, 24));
        if (!cancelled) setPredictionData(predictions);
      } catch (err) {
        console.warn("Predictions backend offline → using last known data");
      }
      if (!cancelled) setLoading(false);
    })();

    setPollutantsLoading(true);
    
    // 🔥 Refactored to ensure single fetch on mount then interval
    const initPollutants = async () => {
      await loadPollutants();
      if (!cancelled) {
        const id = setInterval(loadPollutants, 60000);
        intervalRef.current = id;
      }
    };
    initPollutants();

    return () => { 
      cancelled = true; 
      if (intervalRef.current) clearInterval(intervalRef.current); 
    };
  }, [city]);

  const pollutants = [
    ["PM2.5", pollutantsData?.pm25, "µg/m³"],
    ["PM10", pollutantsData?.pm10, "µg/m³"],
    ["NO2", pollutantsData?.no2, "ppb"],
    ["SO2", pollutantsData?.so2, "ppb"],
    ["O3", pollutantsData?.o3, "ppb"],
    ["CO", pollutantsData?.co, "ppb"],
  ];

  const confidencePercent = (() => {
    const low = predictionData?.confidence_low;
    const high = predictionData?.confidence_high;
    const predicted = predictionData?.predictions?.[0]?.pm25;

    if (low == null || high == null || !predicted || predicted === 0) return null;

    const raw = (1 - (high - low) / predicted) * 100;
    return Math.max(0, Math.min(100, Math.round(raw)));
  })();

  return (
    <div className="w-full pb-20 overflow-x-hidden">

      {/* HEATMAP - Unrestricted Full Bleed Component */}
      <div className="w-full mb-8">
        <Heatmap />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MainPredictionCard
          liveAqiData={pollutantsData}
          predData={predictionData}
          loadingPrediction={loading}
          loadingLive={pollutantsLoading}
          confidencePercent={confidencePercent}
        />

        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full mt-8">
          <div className="flex flex-col gap-6 md:grid md:grid-cols-4 md:grid-rows-2 md:auto-rows-fr md:gap-6">

            <div className="w-full md:col-span-1 md:row-span-2 h-full">
              <RealtimeAQICard city={city} externalData={pollutantsData} />
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:col-span-3 md:row-span-2 md:grid md:grid-cols-3 md:grid-rows-2 md:auto-rows-fr md:gap-6 md:pb-0 md:overflow-visible">
              {pollutants.map(([name, val, unit]) => (
                <div key={name} className="min-w-[45%] sm:min-w-[48%] md:min-w-0 snap-start shrink-0 h-full">
                  <PollutantCard
                    name={name}
                    value={val}
                    unit={unit}
                    loading={pollutantsLoading}
                  />
                </div>
              ))}
            </div>

          </div>
        </div>

        <HealthRecommendationCard pm25={pollutantsData?.pm25} />

        <ForecastCard city={city} hours={24} predData={predictionData} />
      </div>
    </div>
  );
}