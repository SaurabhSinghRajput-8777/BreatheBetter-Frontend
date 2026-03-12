// src/components/ui/container-scroll-animation.jsx
// Aceternity UI port → plain React JSX for Vite
// Dark cyber-health theme · mobile-safe (disables 3D on <768px)
import React, { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

export function ContainerScroll({ titleComponent, children }) {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const scaleDimensions = isMobile ? [0.8, 0.95] : [1.05, 1];
    const rotate = useTransform(scrollYProgress, [0, 1], isMobile ? [0, 0] : [20, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions);
    const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0.6, 1, 1]);

    return (
        <div
            className={`${isMobile ? "min-h-[50rem]" : "h-[80rem]"} flex items-center justify-center relative p-4 md:p-20`}
            ref={containerRef}
        >
            <div
                className="py-10 md:py-40 w-full relative"
                style={{ perspective: isMobile ? "none" : "1200px" }}
            >
                <Header translate={translate} titleComponent={titleComponent} />
                <Card rotate={rotate} translate={translate} scale={scale} opacity={opacity} isMobile={isMobile}>
                    {children}
                </Card>
            </div>
        </div>
    );
}

function Header({ translate, titleComponent }) {
    return (
        <motion.div
            style={{ translateY: translate }}
            className="max-w-5xl mx-auto text-center"
        >
            {titleComponent}
        </motion.div>
    );
}

function Card({ rotate, scale, opacity, children, isMobile }) {
    return (
        <motion.div
            style={{
                rotateX: rotate,
                scale,
                opacity,
                boxShadow:
                    "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
            }}
            className={`
        max-w-5xl -mt-12 mx-auto w-full
        border border-white/[0.08]
        p-1.5 md:p-2
        bg-gradient-to-b from-white/[0.06] to-white/[0.02]
        backdrop-blur-sm
        rounded-[24px] md:rounded-[30px]
        shadow-2xl shadow-purple-500/10
        ${isMobile ? "h-[22rem]" : "h-[40rem]"}
      `}
        >
            <div className="h-full w-full overflow-hidden rounded-[20px] md:rounded-2xl bg-[#0c0c14]">
                {children}
            </div>
        </motion.div>
    );
}
