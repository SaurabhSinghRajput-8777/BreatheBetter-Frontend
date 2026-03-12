// src/components/landing/TechnicalSpecs.jsx
// Model Transparency + Performance Metrics
import React from "react";
import { motion } from "framer-motion";
import {
    FlaskConical,
    TreePine,
    BarChart3,
    Sparkles,
    TrendingUp,
    Target,
    Timer,
    Activity,
} from "lucide-react";
import GlassCard from "../ui/GlassCard";
import AnimatedSection from "../ui/AnimatedSection";

// ─── Data ───────────────────────────────────────────────────────────
const MODEL_WEIGHTS = [
    {
        name: "XGBoost",
        weight: 0.5,
        label: "50%",
        color: "from-violet-500 to-purple-500",
        icon: Sparkles,
        desc: "Gradient Boosting",
    },
    {
        name: "Random Forest",
        weight: 0.3,
        label: "30%",
        color: "from-purple-500 to-pink-500",
        icon: TreePine,
        desc: "Bagging Ensemble",
    },
    {
        name: "Linear Regression",
        weight: 0.2,
        label: "20%",
        color: "from-cyan-500 to-blue-500",
        icon: BarChart3,
        desc: "Baseline Regressor",
    },
];

const METRICS = [
    {
        icon: Target,
        label: "MAE",
        value: "~7.8",
        desc: "Mean Absolute Error",
        color: "text-violet-400",
    },
    {
        icon: Activity,
        label: "RMSE",
        value: "~11.4",
        desc: "Root Mean Squared Error",
        color: "text-purple-400",
    },
    {
        icon: TrendingUp,
        label: "R² Score",
        value: "~0.92",
        desc: "Coefficient of Determination",
        color: "text-cyan-400",
    },
    {
        icon: Timer,
        label: "Horizon",
        value: "24h",
        desc: "Prediction Window",
        color: "text-emerald-400",
    },
];

export default function TechnicalSpecs() {
    return (
        <section className="py-24 px-6 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)] -z-10" />

            <div className="max-w-5xl mx-auto">
                {/* Section header */}
                <AnimatedSection>
                    <div className="text-center mb-16">
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400/80 mb-3">
                            Transparency
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
                            Model{" "}
                            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                                Architecture
                            </span>
                        </h2>
                        <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
                            Our ensemble approach blends three complementary algorithms with
                            optimized weights to minimize prediction error.
                        </p>
                    </div>
                </AnimatedSection>

                {/* Model weights */}
                <AnimatedSection delay={0.15}>
                    <GlassCard className="p-8 mb-12" hover={false} glow>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-400/10 flex items-center justify-center">
                                <FlaskConical className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Ensemble Machine Learning</h3>
                                <p className="text-sm text-gray-500">Weighted blending strategy</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {MODEL_WEIGHTS.map((m, i) => {
                                const Icon = m.icon;
                                return (
                                    <div key={m.name} className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2.5">
                                                <Icon className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-300">
                                                    {m.name}
                                                </span>
                                                <span className="text-xs text-gray-600">{m.desc}</span>
                                            </div>
                                            <span className="text-sm font-mono font-bold text-white/80">
                                                {m.label}
                                            </span>
                                        </div>
                                        <div className="w-full h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
                                            <motion.div
                                                className={`h-full rounded-full bg-gradient-to-r ${m.color}`}
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${m.weight * 100}%` }}
                                                viewport={{ once: true }}
                                                transition={{
                                                    duration: 1.2,
                                                    delay: 0.3 + i * 0.15,
                                                    ease: [0.25, 0.46, 0.45, 0.94],
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </GlassCard>
                </AnimatedSection>

                {/* Performance metrics */}
                <AnimatedSection>
                    <div className="text-center mb-10">
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400/80 mb-3">
                            Performance
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                            Data &{" "}
                            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                                Metrics
                            </span>
                        </h2>
                    </div>
                </AnimatedSection>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {METRICS.map((m, i) => {
                        const Icon = m.icon;
                        return (
                            <AnimatedSection key={m.label} delay={i * 0.08}>
                                <GlassCard className="p-6 text-center h-full">
                                    <Icon className={`w-5 h-5 mx-auto mb-3 ${m.color}`} />
                                    <div className="text-2xl md:text-3xl font-bold text-white mb-1 font-mono">
                                        {m.value}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-300 mb-0.5">
                                        {m.label}
                                    </div>
                                    <div className="text-xs text-gray-600">{m.desc}</div>
                                </GlassCard>
                            </AnimatedSection>
                        );
                    })}
                </div>

                {/* Confidence interval disclaimer */}
                <AnimatedSection delay={0.2}>
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                            All predictions include{" "}
                            <span className="text-violet-400/80 font-medium">
                                95% confidence intervals
                            </span>{" "}
                            to quantify forecast uncertainty. Actual values may fall outside
                            predicted ranges during extreme weather events.
                        </p>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
