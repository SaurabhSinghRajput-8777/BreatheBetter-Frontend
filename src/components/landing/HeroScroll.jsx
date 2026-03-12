// src/components/landing/HeroScroll.jsx
// Cinematic hero — dark cyber-health aesthetic (no scroll card)
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroScroll() {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28 px-6">
            {/* ── Ambient background ─────────────────────────── */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_70%)]" />
                <div className="absolute bottom-1/3 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_70%)]" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
                {/* Pill badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-flex items-center gap-2.5 px-5 py-2 mb-8 rounded-full text-xs font-semibold tracking-wide border border-violet-400/20 bg-violet-500/[0.08] backdrop-blur-sm text-violet-300"
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI-Powered Air Quality Forecasting
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.35 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
                >
                    <span className="text-white">Predict Tomorrow's Air.</span>
                    <br />
                    <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        Today.
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-base md:text-lg text-gray-400 max-w-xl mx-auto leading-relaxed mb-10"
                >
                    BreatheBetter uses ensemble machine learning models to forecast
                    urban air quality and deliver proactive health alerts.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.65 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link
                        to="/dashboard"
                        className="group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        Explore Dashboard
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                        to="/about"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.08] text-gray-300 hover:text-white transition-all duration-300 hover:-translate-y-0.5"
                    >
                        Learn More
                    </Link>
                </motion.div>

                {/* Stats strip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto"
                >
                    {[
                        ["6", "Cities"],
                        ["24h", "Forecast"],
                        ["3", "ML Models"],
                    ].map(([num, label]) => (
                        <div key={label} className="text-center">
                            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                                {num}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
