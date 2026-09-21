import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const DesignOverlay = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Smooth spring animation for cursor
    const cursorX = useSpring(0, { stiffness: 500, damping: 28 });
    const cursorY = useSpring(0, { stiffness: 500, damping: 28 });

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX - 16);
            cursorY.set(e.clientY - 16);
        };
        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            {/* 1. Film Grain Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
                <svg className='w-full h-full'>
                    <filter id='noiseFilter'>
                        <feTurbulence
                            type='fractalNoise'
                            baseFrequency='0.8'
                            numOctaves='3'
                            stitchTiles='stitch'
                        />
                    </filter>
                    <rect width='100%' height='100%' filter='url(#noiseFilter)' />
                </svg>
            </div>

            {/* 2. Custom Cursor (Blend Mode) */}
            <motion.div
                className="hidden md:block fixed top-0 left-0 w-6 h-6 bg-white rounded-full mix-blend-exclusion pointer-events-none z-50"
                style={{
                    x: cursorX,
                    y: cursorY
                }}
            />
        </div>
    );
};

export default DesignOverlay;
