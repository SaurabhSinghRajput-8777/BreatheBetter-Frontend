// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import { useUser, RedirectToSignIn } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const ADMIN_ID = import.meta.env.VITE_ADMIN_CLERK_ID || "disabled";

export default function Admin() {
    const { isSignedIn, isLoaded, user } = useUser();
    const [stats, setStats] = useState(null);
    const [devices, setDevices] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);

    // Auth guard
    if (isLoaded && !isSignedIn) return <RedirectToSignIn />;
    if (isLoaded && isSignedIn && user.id !== ADMIN_ID) return <Navigate to="/" replace />;
    if (!isLoaded) return null;

    useEffect(() => {
        (async () => {
            try {
                const [s, d, c] = await Promise.all([
                    fetch(`${API_BASE}/admin/stats`).then((r) => r.json()),
                    fetch(`${API_BASE}/admin/device-breakdown`).then((r) => r.json()),
                    fetch(`${API_BASE}/admin/city-distribution`).then((r) => r.json()),
                ]);
                setStats(s);
                setDevices(d.devices || []);
                setCities(c.cities || []);
            } catch (err) {
                console.error("[Admin] Failed to load analytics:", err);
            }
            setLoading(false);
        })();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const maxDeviceCount = Math.max(...devices.map((d) => d.count), 1);
    const maxCityCount = Math.max(...cities.map((c) => c.count), 1);

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
            {/* Header */}
            <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full text-xs font-semibold tracking-wide border border-red-300/40 dark:border-red-500/30 bg-red-50/60 dark:bg-red-950/40 text-red-700 dark:text-red-300">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Admin Only
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                    Analytics Dashboard
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Platform-wide usage statistics and visitor insights.
                </p>
            </div>

            {/* ═══════ STAT CARDS ═══════ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {[
                    { label: "Total Visitors", value: stats?.total_visitors ?? 0, icon: "👁️", color: "indigo" },
                    { label: "Registered Users", value: stats?.total_registered_users ?? 0, icon: "👤", color: "emerald" },
                    { label: "Profiles Created", value: stats?.total_profiles ?? 0, icon: "📋", color: "amber" },
                    { label: "Alerts Sent", value: stats?.total_alerts_sent ?? 0, icon: "✉️", color: "rose" },
                ].map((card) => (
                    <div
                        key={card.label}
                        className="
              rounded-2xl border border-[var(--card-border)] dark:border-white/[0.06] bg-[var(--card)] dark:bg-white/[0.04] backdrop-blur-md
              p-5 shadow-sm hover:shadow-md transition-shadow
            "
                    >
                        <div className="text-2xl mb-2">{card.icon}</div>
                        <div className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                            {card.value.toLocaleString()}
                        </div>
                        <div className="text-xs font-medium text-[var(--text-secondary)] mt-1">
                            {card.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══════ CHARTS ROW ═══════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Breakdown */}
                <div className="rounded-2xl border border-[var(--card-border)] dark:border-white/[0.06] bg-[var(--card)] dark:bg-white/[0.04] backdrop-blur-md p-6">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-5">
                        Device Breakdown
                    </h2>
                    {devices.length === 0 ? (
                        <p className="text-sm text-[var(--text-secondary)]">No visitor data yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {devices.map((d) => (
                                <div key={d.device_type}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-[var(--text-primary)]">{d.device_type}</span>
                                        <span className="text-[var(--text-secondary)]">{d.count}</span>
                                    </div>
                                    <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                                            style={{ width: `${(d.count / maxDeviceCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* City Distribution */}
                <div className="rounded-2xl border border-[var(--card-border)] dark:border-white/[0.06] bg-[var(--card)] dark:bg-white/[0.04] backdrop-blur-md p-6">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-5">
                        City Distribution
                    </h2>
                    {cities.length === 0 ? (
                        <p className="text-sm text-[var(--text-secondary)]">No user profiles yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {cities.map((c) => (
                                <div key={c.city}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-[var(--text-primary)]">{c.city}</span>
                                        <span className="text-[var(--text-secondary)]">{c.count}</span>
                                    </div>
                                    <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                                            style={{ width: `${(c.count / maxCityCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
