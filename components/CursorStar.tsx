"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useVelocity, useMotionValueEvent } from "framer-motion";

export default function CursorComet() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth springs for trailing
  const smoothX = useSpring(mouseX, { damping: 20, stiffness: 150, mass: 0.5 });
  const smoothY = useSpring(mouseY, { damping: 20, stiffness: 150, mass: 0.5 });

  const velocityX = useVelocity(smoothX);
  const velocityY = useVelocity(smoothY);
  const rotate = useMotionValue(0);
  const tailOpacity = useMotionValue(0);

  useMotionValueEvent(velocityX, "change", (latestVx) => {
    const vy = velocityY.get();
    const speed = Math.sqrt(latestVx * latestVx + vy * vy);
    
    if (speed > 10) {
      // Calculate angle of movement
      let angle = Math.atan2(vy, latestVx) * (180 / Math.PI);
      rotate.set(angle);
      // Show tail only when moving fast
      tailOpacity.set(Math.min(speed / 500, 1));
    } else {
      tailOpacity.set(0);
    }
  });

  useEffect(() => {
    // Hide on touch devices
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-cursor-hover="true"]') || target.closest('button') || target.closest('a') || target.closest('[data-building-hover="true"]')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY, isVisible]);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[100] mix-blend-screen transition-opacity duration-300"
      style={{
        x: smoothX,
        y: smoothY,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Comet Head Glowing aura */}
      <motion.div 
        animate={{ 
          scale: isHovering ? 2.5 : 1,
          opacity: isHovering ? 0.6 : 1
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-white shadow-[0_0_20px_5px_rgba(73,179,252,0.8)] blur-[2px]" 
      />

      {/* Comet Tail SVG */}
      <motion.div
        className="absolute origin-right"
        style={{
          rotate: rotate,
          opacity: tailOpacity,
          left: "-100px", // Offset so head aligns with mouse
          top: "-25px",
          width: "100px",
          height: "50px",
        }}
      >
        <svg viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cometTail" x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
              <stop offset="40%" stopColor="rgba(73,179,252,0.6)" />
              <stop offset="100%" stopColor="rgba(73,179,252,0)" />
            </linearGradient>
            <filter id="blur">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          <path d="M100 25 Q 50 15 0 25 Q 50 35 100 25 Z" fill="url(#cometTail)" filter="url(#blur)" />
        </svg>
      </motion.div>

      {/* Hollow ring that appears on hover */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          scale: isHovering ? 1.5 : 0.5,
          opacity: isHovering ? 1 : 0 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute -left-4 -top-4 w-8 h-8 rounded-full border-[2px] border-white/90 shadow-[0_0_10px_rgba(73,179,252,0.5)]"
      />
    </motion.div>
  );
}
