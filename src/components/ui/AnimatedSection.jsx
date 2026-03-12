// src/components/ui/AnimatedSection.jsx
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function AnimatedSection({
    children,
    className = "",
    delay = 0,
    direction = "up", // "up" | "down" | "left" | "right"
    distance = 50,
    once = true,
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: "-60px" });

    const directionMap = {
        up: { x: 0, y: distance },
        down: { x: 0, y: -distance },
        left: { x: distance, y: 0 },
        right: { x: -distance, y: 0 },
    };

    const offset = directionMap[direction] || directionMap.up;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, ...offset }}
            animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{
                duration: 0.7,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
