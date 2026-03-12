// src/pages/Whitepaper.jsx
// Technical deep-dive — Model Architecture, Data, Performance, Ethics & Privacy
import React, { useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Sun,
    Moon,
    Sparkles,
    TreePine,
    BarChart3,
    Database,
    Globe,
    Shield,
    Lock,
    AlertTriangle,
    Users,
    MapPin,
    Timer,
    Target,
    Activity,
    TrendingUp,
} from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import { Tiles } from "../components/ui/Tiles";

// ─── Fade helper ────────────────────────────────────────────────────
function Fade({ children, delay = 0, className = "" }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── Thin card ──────────────────────────────────────────────────────
function Card({ children, className = "" }) {
    return (
        <div className={`rounded-xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-none dark:border-white/[0.06] bg-[var(--card)] ${className}`}>
            {children}
        </div>
    );
}

// ─── Section heading ────────────────────────────────────────────────
function SectionLabel({ tag, title }) {
    return (
        <div className="mb-6">
            <p
                className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400 mb-1.5"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
                {tag}
            </p>
            <h2
                className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100"
                style={{ fontFamily: "'Fraunces', serif" }}
            >
                {title}
            </h2>
        </div>
    );
}

// ─── Data ───────────────────────────────────────────────────────────
const MODELS = [
    { icon: Sparkles, name: "XGBoost", weight: 0.5, desc: "Gradient Boosting", color: "from-teal-500 to-emerald-500" },
    { icon: TreePine, name: "Random Forest", weight: 0.3, desc: "Bagging Ensemble", color: "from-violet-500 to-purple-500" },
    { icon: BarChart3, name: "Linear Regression", weight: 0.2, desc: "Baseline Regressor", color: "from-amber-500 to-orange-500" },
];

const PERFORMANCE = [
    { icon: Target, label: "MAE", value: "~7.8", desc: "Mean Absolute Error" },
    { icon: Activity, label: "RMSE", value: "~11.4", desc: "Root Mean Squared Error" },
    { icon: TrendingUp, label: "R² Score", value: "~0.92", desc: "Coefficient of Determination" },
    { icon: Timer, label: "Horizon", value: "24h", desc: "Prediction Window" },
];

const DATA_SOURCES = [
    { icon: Globe, name: "OpenWeatherMap", desc: "Real-time meteorological data — temperature, humidity, wind speed, precipitation patterns across supported cities." },
    { icon: Database, name: "CPCB / AQI Stations", desc: "Pollutant concentration readings — PM2.5, PM10, NO₂, O₃, SO₂, CO from Central Pollution Control Board sensors." },
];

const ETHICS = [
    { icon: AlertTriangle, title: "Hallucination Warning", desc: "Predictions are based on statistical patterns in historical data. Forecasts may occasionally be inaccurate and should not replace official environmental advisories or medical guidance.", accent: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-400/5" },
    { icon: Users, title: "Human-in-the-Loop", desc: "BreatheBetter assists with proactive awareness but does not replace environmental agencies, meteorological departments, or medical professionals.", accent: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-400/5" },
    { icon: MapPin, title: "Edge Cases", desc: "The model is optimized for large urban environments with dense sensor coverage. Accuracy may decrease in rural, semi-urban, or coastal areas with sparse monitoring stations.", accent: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-400/5" },
];

const PRIVACY = [
    { icon: Shield, title: "No Personal Data", desc: "View predictions without creating an account. No tracking beyond anonymous page views." },
    { icon: Globe, title: "Public Datasets Only", desc: "All predictions are derived entirely from publicly available government and weather service data." },
    { icon: Lock, title: "TLS Encryption", desc: "Every API request is transmitted over HTTPS with TLS 1.3 encryption for data integrity and privacy." },
];

// ═════════════════════════════════════════════════════════════════════
export default function Whitepaper() {
    const { theme, setTheme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    const toggleTheme = useCallback(() => {
        setTheme(isDark ? "light" : "dark");
    }, [isDark, setTheme]);

    return (
        <div
            className="min-h-screen pb-20 bg-[var(--bg)] transition-colors relative"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
            <Tiles
                tileSize={80}
                className="absolute inset-0 opacity-80 pointer-events-none z-0 mix-blend-multiply dark:mix-blend-screen overflow-hidden"
            />

            {/* ── Header ──────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 bg-[var(--bg)] border-b border-slate-200 dark:border-white/[0.04]">
                <div className="max-w-7xl mx-auto w-full h-20 flex items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <span
                            className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                            style={{ fontFamily: "'Fraunces', serif" }}
                        >
                            BreatheBetter
                        </span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl border border-slate-200 shadow-sm dark:shadow-none dark:border-white/[0.06] bg-[var(--card)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        aria-label="Toggle theme"
                    >
                        {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 md:px-6 pt-12 relative z-10">
                {/* Page title */}
                <Fade>
                    <div className="mb-16 flex flex-col items-center text-center">
                        <p
                            className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400 mb-2"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            Technical Whitepaper
                        </p>
                        <h1
                            className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-3"
                            style={{ fontFamily: "'Fraunces', serif" }}
                        >
                            Model Architecture & Methodology
                        </h1>
                        <p className="text-[0.875rem] text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                            A transparent look at the ensemble ML system powering BreatheBetter's
                            24-hour air quality predictions across 6 Indian metro cities.
                        </p>
                    </div>
                </Fade>

                {/* ── 1. Ensemble Architecture ───────────────────────────── */}
                <Fade>
                    <Card className="p-6 md:p-8 mb-8">
                        <SectionLabel tag="01 — Architecture" title="Weighted Ensemble Blending" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {MODELS.map((m, i) => {
                                const Icon = m.icon;
                                return (
                                    <div key={m.name} className="flex flex-col p-5 rounded-xl border border-slate-200/60 dark:border-white/[0.04] bg-slate-50/50 dark:bg-slate-800/30">
                                        <div className="flex flex-col gap-2 mb-4">
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                                <span className="text-[0.875rem] font-semibold text-slate-800 dark:text-slate-200">{m.name}</span>
                                            </div>
                                            <span className="text-[0.75rem] text-slate-500 dark:text-slate-400">{m.desc}</span>
                                        </div>
                                        <div className="mt-auto">
                                            <div className="flex justify-between items-end mb-1.5">
                                                <span className="text-[0.6875rem] text-slate-500 dark:text-slate-400">Weight</span>
                                                <span
                                                    className="text-[0.8125rem] font-bold text-slate-700 dark:text-slate-300"
                                                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                                >
                                                    {(m.weight * 100)}%
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full bg-slate-200/60 dark:bg-white/[0.04] overflow-hidden">
                                                <motion.div
                                                    className={`h-full rounded-full bg-gradient-to-r ${m.color}`}
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${m.weight * 100}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1, delay: 0.2 + i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </Fade>

                {/* ── 2. Data Sources ────────────────────────────────────── */}
                <Fade>
                    <Card className="p-6 md:p-8 mb-8">
                        <SectionLabel tag="02 — Data" title="Training & Inference Sources" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {DATA_SOURCES.map((s) => {
                                const Icon = s.icon;
                                return (
                                    <div key={s.name} className="flex items-start gap-3 p-5 rounded-xl border border-slate-200/60 dark:border-white/[0.04] bg-slate-50/50 dark:bg-slate-800/30">
                                        <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-[0.875rem] font-semibold text-slate-800 dark:text-slate-200 mb-1.5">{s.name}</h4>
                                            <p className="text-[0.8125rem] text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </Fade>

                {/* ── 3. Performance ─────────────────────────────────────── */}
                <Fade>
                    <Card className="p-6 md:p-8 mb-8">
                        <SectionLabel tag="03 — Performance" title="Prediction Accuracy" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {PERFORMANCE.map((m) => {
                                const Icon = m.icon;
                                return (
                                    <div key={m.label} className="px-5 py-5 text-center flex flex-col items-center justify-center rounded-xl border border-slate-200/60 dark:border-white/[0.04] bg-slate-50/50 dark:bg-slate-800/30">
                                        <Icon className="w-5 h-5 mx-auto mb-3 text-teal-600 dark:text-teal-400" />
                                        <div
                                            className="text-2xl font-bold text-slate-900 dark:text-white mb-1"
                                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                        >
                                            {m.value}
                                        </div>
                                        <div className="text-[0.75rem] font-medium text-slate-600 dark:text-slate-300">{m.label}</div>
                                        <div className="text-[0.6875rem] text-slate-500 dark:text-slate-500 mt-1">{m.desc}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-[0.8125rem] text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                            All predictions include{" "}
                            <span className="font-semibold text-teal-600 dark:text-teal-400">95% confidence intervals</span>{" "}
                            to quantify forecast uncertainty. Actual values may fall outside
                            predicted ranges during extreme weather events or sensor outages.
                        </p>
                    </Card>
                </Fade>

                {/* ── 4. Ethics ──────────────────────────────────────────── */}
                <Fade>
                    <Card className="p-6 md:p-8 mb-8">
                        <SectionLabel tag="04 — Ethics" title="Responsible AI Usage" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {ETHICS.map((e) => {
                                const Icon = e.icon;
                                return (
                                    <div
                                        key={e.title}
                                        className="rounded-xl border border-slate-200/60 dark:border-white/[0.04] bg-slate-50/50 dark:bg-slate-800/30 p-5 flex flex-col"
                                    >
                                        <Icon className={`w-5 h-5 shrink-0 mb-3 ${e.accent}`} />
                                        <h4 className="text-[0.875rem] font-semibold text-slate-800 dark:text-slate-200 mb-1.5">{e.title}</h4>
                                        <p className="text-[0.8125rem] text-slate-600 dark:text-slate-400 leading-relaxed">{e.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </Fade>

                {/* ── 5. Privacy ─────────────────────────────────────────── */}
                <Fade>
                    <Card className="p-6 md:p-8 mb-8">
                        <SectionLabel tag="05 — Privacy" title="Security & Data Minimalism" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {PRIVACY.map((p) => {
                                const Icon = p.icon;
                                return (
                                    <div key={p.title} className="flex flex-col p-5 rounded-xl border border-slate-200/60 dark:border-white/[0.04] bg-slate-50/50 dark:bg-slate-800/30">
                                        <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-3" />
                                        <h4 className="text-[0.875rem] font-semibold text-slate-800 dark:text-slate-200 mb-1.5">{p.title}</h4>
                                        <p className="text-[0.8125rem] text-slate-600 dark:text-slate-400 leading-relaxed">{p.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </Fade>

                {/* ── Footer nav ─────────────────────────────────────────── */}
                <Fade>
                    <div className="flex justify-between items-center border-t border-slate-200/40 dark:border-white/[0.04] pt-6">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Home
                        </Link>
                        <span className="text-[0.6875rem] text-slate-400 dark:text-slate-600">© 2026 BreatheBetter</span>
                    </div>
                </Fade>
            </div>
        </div>
    );
}
