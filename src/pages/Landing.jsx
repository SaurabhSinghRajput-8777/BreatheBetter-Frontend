// src/pages/Landing.jsx
import React, { useContext, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Sun, Moon } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import { getPredict } from "../lib/api";
import { fetchPredictCached } from "../utils/fetchPredictCached";
import { Tiles } from "../components/ui/Tiles";

function usePrefetchPredictions() {
    const { city } = useContext(ThemeContext);
    useEffect(() => {
        let c = false;
        (async () => {
            try {
                await fetchPredictCached(city, () => getPredict(city));
                if (!c) console.log(`[Prefetch] ✅ ${city}`);
            } catch (e) {
                console.warn(`[Prefetch] ❌ ${city}:`, e);
            }
        })();
        return () => { c = true; };
    }, [city]);
}

export default function Landing() {
    const { theme, setTheme } = useContext(ThemeContext);
    const isDark = theme === "dark";
    usePrefetchPredictions();

    const toggleTheme = useCallback(() => {
        setTheme(isDark ? "light" : "dark");
    }, [isDark, setTheme]);

    return (
        <div className="h-screen w-full relative overflow-hidden flex! flex-col! items-center justify-center bg-[var(--bg)]">
            <Tiles
                tileSize={60}
                className="absolute inset-0 pointer-events-none z-0 mix-blend-multiply dark:mix-blend-screen opacity-100"
            />

            <div className="absolute top-8 left-8 z-50 text-2xl font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                BreatheBetter
            </div>

            <div className="absolute top-8 right-8 z-50">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl border border-slate-200/60 dark:border-white/[0.08] bg-[var(--card)] transition-all"
                    aria-label="Toggle theme"
                >
                    {isDark ? (
                        <Sun className="w-5 h-5 text-amber-400" />
                    ) : (
                        <Moon className="w-5 h-5 text-slate-500" />
                    )}
                </button>
            </div>

            <main className="flex! flex-col! items-center text-center max-w-4xl px-4 gap-6 md:gap-8 w-full! relative z-10">
                <h1
                    className="text-5xl! md:text-7xl! font-bold tracking-tight text-slate-900 dark:text-slate-100"
                    style={{ fontFamily: "'Fraunces', serif" }}
                >
                    Predict Tomorrow's Air.{" "}
                    <span className="bg-gradient-to-r from-teal-600 to-emerald-500 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                        Today.
                    </span>
                </h1>



                <div className="flex! flex-col! sm:flex-row! gap-5 w-full justify-center">
                    <Link
                        to="/whitepaper"
                        className="inline-flex! items-center justify-center gap-2 w-full sm:w-[300px] py-3.5! rounded-full text-base font-bold border-2 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 bg-[var(--bg)] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-transform hover:-translate-y-0.5"
                    >
                        <FileText className="w-5 h-5 shrink-0" />
                        View Technical Whitepaper
                    </Link>
                    <Link
                        to="/dashboard"
                        className="inline-flex! items-center justify-center gap-2 w-full sm:w-[300px] py-3.5! rounded-full text-base font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg transition-transform hover:-translate-y-0.5"
                    >
                        Explore Dashboard
                        <ArrowRight className="w-5 h-5 shrink-0" />
                    </Link>
                </div>
            </main>

            <div className="absolute bottom-8 left-0 w-full px-4 flex justify-center z-10">
                <p className="text-[12px] uppercase tracking-widest opacity-80 max-w-lg text-slate-500 dark:text-slate-400 text-center">
                    Statistical prediction model. Accuracy may vary based on
                    environmental sensors. We do not claim 100% guarantee of forecast
                    precision.
                </p>
            </div>
        </div>
    );
}
