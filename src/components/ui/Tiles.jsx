import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function Tiles({ tileSize = 60, className = "" }) {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ cols: 0, rows: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                const cols = Math.ceil(clientWidth / tileSize);
                const rows = Math.ceil(clientHeight / tileSize);
                setDimensions({ cols, rows });
            }
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, [tileSize]);

    const tileCount = dimensions.cols * dimensions.rows;

    return (
        <div
            ref={containerRef}
            className={`w-full h-full overflow-hidden ${className}`}
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${dimensions.cols}, ${tileSize}px)`,
                gridTemplateRows: `repeat(${dimensions.rows}, ${tileSize}px)`,
            }}
        >
            {Array.from({ length: tileCount }).map((_, i) => (
                <Tile key={i} />
            ))}
        </div>
    );
}

function Tile() {
    const delayFade = Math.random() * 2;
    const pulseDuration = Math.random() * 4 + 4;
    const pulseDelay = Math.random() * 8;

    return (
        <motion.div
            className="w-full h-full border-[0.5px] border-slate-900/10 dark:border-white/10"
            initial={{ opacity: 0.5 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: delayFade }}
        >
            <motion.div
                className="w-full h-full"
                initial={{ backgroundColor: "rgba(0,0,0,0)" }}
                animate={{
                    backgroundColor: ["rgba(0,0,0,0)", "var(--tile)", "rgba(0,0,0,0)"]
                }}
                transition={{
                    duration: pulseDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: pulseDelay,
                }}
            />
        </motion.div>
    );
}
