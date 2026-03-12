// src/components/ui/GlassCard.jsx
import React from "react";

export default function GlassCard({
    children,
    className = "",
    hover = true,
    glow = false,
    ...props
}) {
    return (
        <div
            className={`
        relative rounded-2xl
        bg-white/[0.03] backdrop-blur-xl
        border border-white/[0.06]
        ${hover ? "hover:bg-white/[0.06] hover:border-white/[0.12] hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/5" : ""}
        transition-all duration-500 ease-out
        ${glow ? "shadow-[0_0_40px_-12px_rgba(139,92,246,0.15)]" : ""}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
}
