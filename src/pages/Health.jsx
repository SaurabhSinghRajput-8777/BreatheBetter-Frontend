// src/pages/Health.jsx
import React, { useState, useContext, useEffect, useMemo } from "react";
import { useUser, RedirectToSignIn } from "@clerk/clerk-react";
import { ThemeContext } from "../context/ThemeContext";
import { pm25ToAQI, getAQICategory, getAQIColor } from "../utils/aqiUtils";
import { fetchPollutantsCached } from "../utils/fetchPollutantsCached";
import { getLivePollutants } from "../lib/api";
import { HeartPulse, Shield, Wind, Activity, CheckCircle, AlertOctagon, TrendingUp, AlertTriangle, Mail, Check, Loader2, Pencil, Send, X, Trophy, Zap, Star, Target, Eye } from "lucide-react";

import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CITY_COORDS = {
  Delhi: [28.7041, 77.1025],
  Mumbai: [19.076, 72.8777],
  Bengaluru: [12.9716, 77.5946],
  Hyderabad: [17.385, 78.4867],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
};

const PROFILES = [
  { id: "normal", label: "General", desc: "Standard health monitoring" },
  { id: "asthma", label: "Asthma", desc: "Sensitive to PM2.5 spikes" },
  { id: "allergies", label: "Allergies", desc: "Monitor pollen & dust" },
  { id: "elderly", label: "Elderly", desc: "Caution advised at lower thresholds" },
  { id: "athlete", label: "Athlete", desc: "Optimize outdoor training times" },
];

export default function Health() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { city, theme } = useContext(ThemeContext);

  const [activeProfile, setActiveProfile] = useState("asthma");
  const [liveAqiData, setLiveAqiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportedPins, setReportedPins] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [hazardType, setHazardType] = useState("");
  const [isCustomHazard, setIsCustomHazard] = useState(false);
  const [customHazard, setCustomHazard] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState("leaderboard");

  // Fetch live AQI for the banner and recommendations
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const pollData = await fetchPollutantsCached(city, () => getLivePollutants(city));
        if (!cancelled) setLiveAqiData(pollData);
      } catch (err) {
        console.warn("Could not fetch pollutants for Health page");
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [city]);

  const pm25 = liveAqiData?.pm25 || 0;
  const aqi = pm25ToAQI(pm25);
  const aqiCategory = getAQICategory(aqi);
  const aqiColor = getAQIColor(aqi);

  // Compute Gamification Points (Mock logic: higher is better air)
  const points = Math.max(0, 1000 - aqi * 2);
  const pointRingStroke = (points / 1000) * 283; // 283 is approx circumference of r=45

  // Hazard preset selection
  const HAZARD_PRESETS = [
    { id: "dust", label: "Construction Dust", icon: "🏗️" },
    { id: "fire", label: "Stubble Burning", icon: "🔥" },
    { id: "smoke", label: "Industrial Emissions", icon: "🏭" },
    { id: "traffic", label: "Vehicle Emissions", icon: "🚗" },
  ];

  const handlePresetSelect = (id) => {
    setHazardType(id);
    setIsCustomHazard(false);
    setCustomHazard("");
  };

  const handleCustomChange = (val) => {
    setCustomHazard(val);
    setHazardType(val);
    setIsCustomHazard(val.length > 0);
    // if user starts typing, deselect any preset
  };

  const handleSubmitReport = () => {
    const finalType = isCustomHazard ? customHazard.trim() : hazardType;
    if (!finalType) return;

    const baseCoords = CITY_COORDS[city] || CITY_COORDS["Delhi"];
    const offset = 0.05;
    const randomLat = baseCoords[0] + (Math.random() * offset * 2 - offset);
    const randomLng = baseCoords[1] + (Math.random() * offset * 2 - offset);

    setReportedPins(prev => [...prev, {
      id: Date.now(),
      type: finalType,
      lat: randomLat,
      lng: randomLng
    }]);

    setSubmitSuccess(true);
    setHazardType("");
    setCustomHazard("");
    setIsCustomHazard(false);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  if (isLoaded && !isSignedIn) return <RedirectToSignIn />;
  if (!isLoaded) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-20">

      {/* HEADER + PROFILE SELECTOR */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          {/* Left: Title */}
          <div className="shrink-0">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-500/20 rounded-xl text-rose-500 shadow-sm border border-rose-100 dark:border-rose-500/20">
                <HeartPulse className="w-6 h-6" />
              </div>
              Health Dashboard
            </h1>
            <p className="text-[var(--text-secondary)] mt-2 max-w-2xl font-medium ml-1">
              Personalized air quality insights and proactive recommendations tailored to your specific health needs.
            </p>
          </div>

          {/* Right: Collapsed Profile (only on desktop row, mobile stacks below) */}
          {!editingProfile && (
            <button
              onClick={() => setEditingProfile(true)}
              className="group flex items-center gap-4 bg-indigo-600 border border-indigo-500 shadow-indigo-500/25 shadow-lg px-5 py-3 rounded-2xl transition-all duration-200 hover:bg-indigo-700 hover:scale-[1.02] cursor-pointer text-left shrink-0"
            >
              <div className="flex flex-col items-start gap-1">
                <span className="font-bold text-white text-sm sm:text-base">
                  {PROFILES.find(p => p.id === activeProfile)?.label}
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-indigo-100">
                  {PROFILES.find(p => p.id === activeProfile)?.desc}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-colors">
                <Pencil className="w-4 h-4" />
              </div>
            </button>
          )}
        </div>

        {/* Expanded Profile Selector (flows below on expand) */}
        {editingProfile && (
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-4">
              Select Health Profile
            </h2>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {PROFILES.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => { setActiveProfile(profile.id); setEditingProfile(false); }}
                  className={`
                    flex-1 min-w-[140px] sm:min-w-[160px] px-5 py-3 rounded-2xl flex flex-col items-start gap-1 transition-all duration-300 border
                    ${activeProfile === profile.id
                      ? "bg-indigo-600 border-indigo-500 shadow-indigo-500/25 shadow-lg scale-105"
                      : "bg-[var(--card)] border-[var(--card-border)] hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md cursor-pointer"}
                  `}
                >
                  <span className={`font-bold ${activeProfile === profile.id ? "text-white" : "text-[var(--text-primary)]"}`}>
                    {profile.label}
                  </span>
                  <span className={`text-[10px] sm:text-xs font-medium ${activeProfile === profile.id ? "text-indigo-100" : "text-[var(--text-secondary)]"}`}>
                    {profile.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PROACTIVE ALERT BANNER */}
      {!loading && aqi > 100 && (
        <div
          className="mb-8 rounded-3xl p-6 lg:p-8 flex items-start md:items-center gap-4 border shadow-sm transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{
            backgroundColor: `${aqiColor}15`,
            borderColor: `${aqiColor}40`
          }}
        >
          <div className="p-3 rounded-full flex-shrink-0" style={{ backgroundColor: `${aqiColor}25`, color: aqiColor }}>
            <AlertOctagon className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-bold flex items-center gap-2" style={{ color: aqiColor }}>
              Proactive Health Alert
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: aqiColor }}>
                {aqiCategory}
              </span>
            </h3>
            <p className="text-sm md:text-base font-medium mt-1 text-[var(--text-primary)] opacity-90">
              PM2.5 levels in <span className="font-bold">{city}</span> have breached your safety thresholds.
              {activeProfile === 'asthma' ? " Keep inhalers nearby and avoid strenuous outdoor exercise." : " Limit outdoor exposure if possible."}
            </p>
          </div>
        </div>
      )}

      {/* EMAIL ALERT SUBSCRIPTION */}
      <EmailAlertSubscription user={user} />

      {/* GAMIFICATION & RECOMMENDATIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Left Column: Gamification Panel */}
        <div className="flex flex-col h-full lg:col-span-1">
          <div
            onClick={() => { setIsLeaderboardOpen(true); setLeaderboardTab("leaderboard"); }}
            className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 lg:p-8 shadow-md backdrop-blur-md flex flex-col items-center justify-center text-center flex-1 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group"
          >
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-5">
              Clean Air Points
            </h2>

            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* SVG Ring Background */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-800" />
                {/* SVG Ring Progress */}
                <circle
                  cx="80" cy="80" r="45" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray="283" strokeDashoffset={283 - pointRingStroke}
                  className="transition-all duration-1000 ease-out drop-shadow-md"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="flex flex-col items-center">
                <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 drop-shadow-sm">
                  {loading ? "..." : points}
                </span>
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Points</span>
              </div>
            </div>

            <p className="text-sm font-medium text-[var(--text-secondary)] mt-6">
              You are in the <span className="font-bold text-indigo-500">Top 12%</span> of Breathtakers in {city} this week!
            </p>
            <div
              className="mt-4 w-full py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-sm border border-indigo-100 dark:border-indigo-500/20 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors text-center"
            >
              View Leaderboard
            </div>
          </div>
        </div>

        {/* Right Column: Recommendations Grid */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 lg:p-8 shadow-md backdrop-blur-md h-full">
            <div className="flex items-start sm:items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-500 shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] truncate">Tailored Advice: {PROFILES.find(p => p.id === activeProfile)?.label}</h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">Actions to take right now based on {loading ? "current" : <span style={{ color: aqiColor }} className="font-bold">{aqiCategory}</span>} air quality.</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700/50 animate-pulse"></div>
                <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700/50 animate-pulse"></div>
                <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700/50 animate-pulse"></div>
                <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700/50 animate-pulse"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RecommendationTip
                  icon={<Wind />}
                  title="Ventilation"
                  desc={aqi < 100 ? "Open windows to circulate fresh air." : "Keep windows completely closed."}
                  color="blue"
                />
                <RecommendationTip
                  icon={<Activity />}
                  title="Exercise"
                  desc={aqi < 100 ? "Outdoor workouts are fully safe." : activeProfile === 'athlete' ? "Shift training to indoor gyms today." : "Avoid all outdoor exertion."}
                  color="emerald"
                />
                <RecommendationTip
                  icon={<Shield />}
                  title="Protection"
                  desc={aqi > 200 ? "N95 Mask strictly required outdoors." : activeProfile === 'asthma' && aqi > 50 ? "Wear a mask if sensitive." : "No mask required."}
                  color="amber"
                />
                <RecommendationTip
                  icon={<HeartPulse />}
                  title="Medication"
                  desc={activeProfile === 'asthma' ? "Keep rescue inhaler easily accessible." : activeProfile === 'allergies' ? "Take antihistamines if symptoms appear." : "No special medication needed."}
                  color="rose"
                />
              </div>
            )}
          </div>
        </div>

      </div>

      {/* COMMUNITY HAZARD REPORTER */}
      <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        Community Hazard Reporter
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Report Form */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 lg:p-8 shadow-md backdrop-blur-md">
          <p className="text-sm text-[var(--text-secondary)] mb-5">
            Help your community by instantly reporting local environmental hazards. These reports improve our real-time localized heatmaps.
          </p>

          {/* Quick-Action Preset Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {HAZARD_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left cursor-pointer
                  ${hazardType === preset.id && !isCustomHazard
                    ? "bg-indigo-600 border-indigo-500 shadow-indigo-500/25 shadow-md scale-[1.02]"
                    : "bg-[var(--bg)] dark:bg-white/[0.02] border-[var(--card-border)] hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm"}
                `}
              >
                <span className="text-xl leading-none">{preset.icon}</span>
                <span className={`font-semibold text-sm ${hazardType === preset.id && !isCustomHazard ? "text-white" : "text-[var(--text-primary)]"}`}>
                  {preset.label}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Hazard Input */}
          <div className="mb-5">
            <input
              type="text"
              placeholder="Other hazard — describe it here..."
              value={customHazard}
              onChange={(e) => handleCustomChange(e.target.value)}
              className="w-full px-4 py-3 text-sm font-medium rounded-xl border border-[var(--card-border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmitReport}
            disabled={!(isCustomHazard ? customHazard.trim() : hazardType)}
            className={`
              w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 border
              ${(isCustomHazard ? customHazard.trim() : hazardType)
                ? "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 cursor-pointer"
                : "bg-gray-100 dark:bg-gray-800 border-[var(--card-border)] text-[var(--text-secondary)] opacity-60 cursor-not-allowed"}
            `}
          >
            {submitSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Reported Successfully — Thank You!
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Report
              </>
            )}
          </button>
        </div>

        {/* Mini Map embedded visualization */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-3 lg:p-4 shadow-md backdrop-blur-md h-[400px] lg:h-auto relative overflow-hidden flex flex-col">
          <div className="absolute top-6 left-6 z-10 bg-white/90 dark:bg-black/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-lg pointer-events-none">
            <h4 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Live Community Reports
            </h4>
            <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mt-1 tracking-wider">{city} Region</p>
          </div>

          <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
            <MapContainer
              center={CITY_COORDS[city] || CITY_COORDS["Delhi"]}
              zoom={11}
              zoomControl={false}
              scrollWheelZoom={false}
              dragging={false}
              className="w-full h-full z-0"
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              <MapUpdater center={CITY_COORDS[city] || CITY_COORDS["Delhi"]} pins={reportedPins} />
            </MapContainer>

            {/* Gradient overlay to fade edges into the card */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] rounded-2xl"></div>
          </div>
        </div>

      </div>

      {/* LEADERBOARD MODAL */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        activeTab={leaderboardTab}
        setActiveTab={setLeaderboardTab}
        userPoints={points}
        userName={user?.firstName || "You"}
        city={city}
      />

    </div>
  );
}

// -------------------------------------------------------------
// LeaderboardModal Component
// -------------------------------------------------------------

const DUMMY_LEADERBOARD = [
  { rank: 1, name: "Priya S.", points: 1420, avatar: "🥇" },
  { rank: 2, name: "Arjun M.", points: 1180, avatar: "🥈" },
  { rank: 3, name: null, points: null, avatar: "🏅", isCurrentUser: true },
  { rank: 4, name: "Neha R.", points: 720, avatar: "🌿" },
  { rank: 5, name: "Vikram K.", points: 580, avatar: "🍃" },
];

const EARN_ACTIONS = [
  { icon: <AlertTriangle className="w-5 h-5" />, label: "Report a Hazard", points: "+50", color: "text-amber-500" },
  { icon: <Eye className="w-5 h-5" />, label: "Daily App Open", points: "+10", color: "text-blue-500" },
  { icon: <Mail className="w-5 h-5" />, label: "Set up Custom Alerts", points: "+20", color: "text-indigo-500" },
  { icon: <Target className="w-5 h-5" />, label: "Complete Weekly Challenge", points: "+100", color: "text-emerald-500" },
  { icon: <Star className="w-5 h-5" />, label: "First Report of the Day", points: "+25", color: "text-purple-500" },
  { icon: <Zap className="w-5 h-5" />, label: "7-Day Login Streak", points: "+150", color: "text-rose-500" },
];

function LeaderboardModal({ isOpen, onClose, activeTab, setActiveTab, userPoints, userName, city }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-[var(--card)] border border-[var(--card-border)] rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
              <Trophy className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Clean Air Hub</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mx-6 mt-4 p-1 rounded-xl bg-gray-100 dark:bg-white/5">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === "leaderboard"
              ? "bg-[var(--card)] text-[var(--text-primary)] shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
          >
            Local Heroes
          </button>
          <button
            onClick={() => setActiveTab("earn")}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === "earn"
              ? "bg-[var(--card)] text-[var(--text-primary)] shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
          >
            Earn Points
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "leaderboard" ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                {city} — This Week
              </p>
              {DUMMY_LEADERBOARD.map((entry) => {
                const isMe = entry.isCurrentUser;
                return (
                  <div
                    key={entry.rank}
                    className={`
                      flex items-center gap-4 p-3.5 rounded-xl border transition-all
                      ${isMe
                        ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-sm"
                        : "border-[var(--card-border)] dark:border-white/5 bg-[var(--bg)] dark:bg-white/[0.02]"}
                    `}
                  >
                    {/* Rank */}
                    <span className={`text-lg font-extrabold w-7 text-center shrink-0 ${entry.rank === 1 ? "text-amber-500" :
                      entry.rank === 2 ? "text-gray-400" :
                        entry.rank === 3 ? "text-orange-400" : "text-[var(--text-secondary)]"
                      }`}>
                      {entry.rank}
                    </span>

                    {/* Avatar */}
                    <span className="text-2xl leading-none">{entry.avatar}</span>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${isMe ? "text-indigo-600 dark:text-indigo-400" : "text-[var(--text-primary)]"
                        }`}>
                        {isMe ? `${userName} (You)` : entry.name}
                      </p>
                      {isMe && (
                        <p className="text-[10px] font-bold text-indigo-500/80 uppercase tracking-wider">Your Rank</p>
                      )}
                    </div>

                    {/* Points */}
                    <span className={`font-extrabold text-sm shrink-0 ${isMe
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500"
                      : "text-[var(--text-primary)]"
                      }`}>
                      {isMe ? userPoints : entry.points}
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] ml-0.5">pts</span>
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                Ways to earn points
              </p>
              {EARN_ACTIONS.map((action, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3.5 rounded-xl border border-[var(--card-border)] dark:border-white/5 bg-[var(--bg)] dark:bg-white/[0.02]"
                >
                  <div className={`p-2 rounded-lg bg-gray-50 dark:bg-white/5 shrink-0 ${action.color}`}>
                    {action.icon}
                  </div>
                  <p className="flex-1 font-semibold text-sm text-[var(--text-primary)]">
                    {action.label}
                  </p>
                  <span className="font-extrabold text-sm text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 shrink-0">
                    {action.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Helper Components
// -------------------------------------------------------------




// Map Updater & Pin layer
const HAZARD_LABELS = {
  dust: "🏗️ Construction Dust",
  fire: "🔥 Stubble Burning",
  smoke: "🏭 Industrial Emissions",
  traffic: "🚗 Vehicle Emissions",
};

function MapUpdater({ center, pins }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 11, { duration: 1.5 });
  }, [center, map]);

  return (
    <>
      {pins.map(pin => (
        <Marker
          key={pin.id}
          position={[pin.lat, pin.lng]}
          icon={L.divIcon({
            className: "custom-pin",
            html: `<div style="
              width: 20px; 
              height: 20px; 
              background: #ef4444; 
              border: 3px solid white; 
              border-radius: 50%;
              box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
              animation: pulse-pin 2s infinite;
            "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })}
        >
          <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
            <span style={{ fontWeight: 600, fontSize: "13px" }}>
              {HAZARD_LABELS[pin.type] || `⚠️ ${pin.type}`}
            </span>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}

// Sub-component for individual recommendation tips
function RecommendationTip({ icon, title, desc, color }) {
  const colorStyles = {
    blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-500/20",
    rose: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--card-border)] dark:border-white/5 bg-[var(--bg)] dark:bg-white/[0.02] hover:shadow-sm transition-shadow h-full">
      <div className={`w-12 h-12 flex items-center justify-center rounded-xl border ${colorStyles[color]} shadow-sm shrink-0`}>
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-bold text-[var(--text-primary)] text-sm mb-0.5">{title}</h4>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-snug">{desc}</p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Email Alert Subscription Component
// -------------------------------------------------------------
function EmailAlertSubscription({ user }) {
  const [enabled, setEnabled] = useState(false);
  const [email, setEmail] = useState("");
  const [threshold, setThreshold] = useState("150");
  const [customVal, setCustomVal] = useState("120");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Initialize email once user is available
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && !email) {
      setEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [user]);

  const handleToggle = () => {
    if (enabled) {
      setEnabled(false); // Immediate disable
    } else {
      if (!email) return;

      // PARSE STRING STRICTLY AS INTEGER FOR RESEND PAYLOAD
      const parsedThreshold = parseInt(threshold === 'custom' ? customVal : threshold, 10);

      if (isNaN(parsedThreshold) || parsedThreshold < 1 || parsedThreshold > 500) {
        alert("Please enter a valid AQI threshold between 1 and 500.");
        return;
      }

      setLoading(true);
      // Mock API call (In reality, sending structured integer to Resend here)
      console.log("Payload ready for Resend API:", { email, threshold: parsedThreshold });

      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setEnabled(true);
        setTimeout(() => setSuccess(false), 3000);
      }, 1500);
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-3xl p-6 lg:p-8 shadow-md backdrop-blur-md mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 transition-all duration-300">

      <div className="flex items-start gap-4 flex-1">
        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 shrink-0 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Get Proactive Alerts</h3>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
            We'll email you before pollution spikes in your area.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || enabled}
          className="px-4 py-3 sm:py-2.5 text-sm font-medium rounded-xl border border-[var(--card-border)] bg-[var(--bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition-colors w-full sm:w-56"
        />

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <select
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              disabled={loading || enabled}
              className="appearance-none pr-10 px-4 py-3 sm:py-2.5 text-sm font-medium rounded-xl border border-[var(--card-border)] bg-[var(--bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition-colors w-full sm:w-auto cursor-pointer"
            >
              <option value="100">AQI &gt; 100 (Sensitive)</option>
              <option value="150">AQI &gt; 150 (Unhealthy)</option>
              <option value="200">AQI &gt; 200 (Hazardous)</option>
              <option value="custom">Custom Value</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-secondary)]">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {threshold === 'custom' && (
            <input
              type="number"
              min="1"
              max="500"
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              disabled={loading || enabled}
              placeholder="AQI"
              className="w-full xs:w-20 px-3 py-3 sm:py-2.5 text-sm font-medium rounded-xl border border-[var(--card-border)] bg-[var(--bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition-colors"
            />
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto h-12 sm:h-10 ml-1">
          {success && (
            <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-500 animate-in fade-in slide-in-from-bottom-2">
              <Check className="w-4 h-4" /> Subscribed
            </span>
          )}

          <button
            onClick={handleToggle}
            disabled={loading || (!email && !enabled)}
            className={`
              relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-[var(--bg)]
              ${enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'}
              ${(loading || (!email && !enabled)) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span
              className={`
                inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm
                ${enabled ? 'translate-x-8' : 'translate-x-1'}
                ${loading ? 'scale-75' : 'scale-100'}
              `}
            >
              {loading && (
                <Loader2 className="absolute inset-0 m-auto w-3.5 h-3.5 text-indigo-600 animate-spin" />
              )}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
