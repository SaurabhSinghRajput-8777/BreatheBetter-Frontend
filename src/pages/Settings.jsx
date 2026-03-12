// src/pages/HealthSettings.jsx
import React, { useEffect, useState } from "react";
import { useUser, RedirectToSignIn } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const CITIES = ["Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata"];
const SENSITIVITIES = [
    { value: "normal", label: "Low — No respiratory conditions" },
    { value: "sensitive", label: "Moderate — Mild allergies / asthma" },
    { value: "very_sensitive", label: "High — Chronic respiratory / cardiac issues" },
];
const FREQUENCIES = [
    { value: "daily", label: "Daily Summary" },
    { value: "dangerous_only", label: "Dangerous Levels Only" },
    { value: "never", label: "Disabled" },
];

export default function HealthSettings() {
    const { isSignedIn, isLoaded, user } = useUser();

    const [form, setForm] = useState({
        preferred_city: "Delhi",
        health_sensitivity: "normal",
        alert_threshold: 150,
        alert_frequency: "daily",
    });
    const [profileExists, setProfileExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Redirect to sign-in if not authenticated
    if (isLoaded && !isSignedIn) return <RedirectToSignIn />;
    if (!isLoaded) return null;

    const clerkUserId = user.id;
    const email = user.primaryEmailAddress?.emailAddress || "";

    // Fetch existing profile on mount
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/profile?clerk_user_id=${encodeURIComponent(clerkUserId)}`);
                const data = await res.json();
                if (!cancelled && data.profile) {
                    setForm({
                        preferred_city: data.profile.preferred_city || "Delhi",
                        health_sensitivity: data.profile.health_sensitivity || "normal",
                        alert_threshold: data.profile.alert_threshold ?? 150,
                        alert_frequency: data.profile.alert_frequency || "daily",
                    });
                    setProfileExists(true);
                }
            } catch (err) {
                console.warn("[HealthSettings] Failed to fetch profile:", err);
            }
            if (!cancelled) setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [clerkUserId]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setToast(null);
        try {
            const method = profileExists ? "PUT" : "POST";
            const body = {
                clerk_user_id: clerkUserId,
                email,
                ...form,
                alert_threshold: Number(form.alert_threshold),
            };

            const res = await fetch(`${API_BASE}/profile`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Save failed");
            }

            setProfileExists(true);
            setToast({ type: "success", text: "Settings saved successfully!" });
        } catch (err) {
            setToast({ type: "error", text: err.message });
        }
        setSaving(false);
        setTimeout(() => setToast(null), 4000);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const inputClass = `
    w-full px-3 py-2.5 rounded-lg text-sm
    bg-[var(--bg)] text-[var(--text-primary)]
    border border-[var(--card-border)]
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
    transition
  `;

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-10 md:py-14">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl text-indigo-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    Health Settings
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Manage your health profile and alert preferences. These shape your predictions and notifications.
                </p>
            </div>

            {/* ──────────────────────────────────────────────── */}
            {/* SECTION 1: HEALTH PROFILE                       */}
            {/* ──────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-[var(--card-border)] dark:border-white/[0.06] bg-[var(--card)] dark:bg-white/[0.04] backdrop-blur-md p-6 mb-6">
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-6">
                    Health Profile
                </h2>

                <div className="space-y-5">
                    {/* Preferred City */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                            Preferred City
                        </label>
                        <select
                            value={form.preferred_city}
                            onChange={(e) => handleChange("preferred_city", e.target.value)}
                            className={inputClass}
                        >
                            {CITIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                            Dashboard and predictions will default to this city.
                        </p>
                    </div>

                    {/* Health Sensitivity */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                            Health Sensitivity
                        </label>
                        <div className="space-y-2">
                            {SENSITIVITIES.map((s) => (
                                <label
                                    key={s.value}
                                    className={`
                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                    ${form.health_sensitivity === s.value
                                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                                            : "border-[var(--card-border)] hover:border-gray-400 dark:hover:border-gray-500"
                                        }
                  `}
                                >
                                    <input
                                        type="radio"
                                        name="health_sensitivity"
                                        value={s.value}
                                        checked={form.health_sensitivity === s.value}
                                        onChange={(e) => handleChange("health_sensitivity", e.target.value)}
                                        className="accent-indigo-600"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">{s.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ──────────────────────────────────────────────── */}
            {/* SECTION 2: ALERT SETTINGS                       */}
            {/* ──────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-[var(--card-border)] dark:border-white/[0.06] bg-[var(--card)] dark:bg-white/[0.04] backdrop-blur-md p-6 mb-6">
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-6">
                    Alert Settings
                </h2>

                <div className="space-y-5">
                    {/* Alert Threshold */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                            Alert Threshold (PM2.5 µg/m³)
                        </label>
                        <input
                            type="number"
                            min={10}
                            max={500}
                            value={form.alert_threshold}
                            onChange={(e) => handleChange("alert_threshold", e.target.value)}
                            className={inputClass}
                        />
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                            You'll be alerted when predicted PM2.5 exceeds this value. WHO guideline: 15 µg/m³.
                        </p>
                    </div>

                    {/* Alert Frequency */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                            Alert Frequency
                        </label>
                        <select
                            value={form.alert_frequency}
                            onChange={(e) => handleChange("alert_frequency", e.target.value)}
                            className={inputClass}
                        >
                            {FREQUENCIES.map((f) => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Info note */}
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                        <svg className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300">
                            Alerts are evaluated every 6 hours by our prediction engine.
                        </p>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="
          w-full py-3 rounded-xl text-sm font-semibold
          bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700
          text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl
          transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
        "
            >
                {saving ? "Saving..." : profileExists ? "Update Settings" : "Save Settings"}
            </button>

            {/* Toast */}
            {toast && (
                <div
                    className={`
            mt-4 px-4 py-3 rounded-xl text-sm font-medium text-center
            transition-all duration-300
            ${toast.type === "success"
                            ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 border border-green-300/40"
                            : "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-300/40"
                        }
          `}
                >
                    {toast.text}
                </div>
            )}
        </div>
    );
}
