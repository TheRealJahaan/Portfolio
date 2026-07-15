"use client";

import { useMemo, useEffect, useState } from "react";
import { seededRandom } from "@/lib/seededRandom";
import { motion, useSpring, useTransform, useMotionValue, MotionValue } from "framer-motion";

interface StarData {
  id: number;
  top: string;
  left: string;
  size: string;
  animationDelay: string;
  opacity: number;
  parallaxMultiplier: number;
}

function Star({ 
  star, 
  smoothX, 
  smoothY, 
  prefersReducedMotion 
}: { 
  star: StarData; 
  smoothX: MotionValue<number>; 
  smoothY: MotionValue<number>; 
  prefersReducedMotion: boolean 
}) {
  // Move opposite to the mouse for a standard parallax depth effect
  const x = useTransform(smoothX, (v) => v * star.parallaxMultiplier * -1);
  const y = useTransform(smoothY, (v) => v * star.parallaxMultiplier * -1);

  return (
    <motion.div
      className="absolute bg-white rounded-full"
      style={{
        top: star.top,
        left: star.left,
        width: star.size,
        height: star.size,
        opacity: star.opacity,
        x,
        y,
        animation: prefersReducedMotion 
          ? 'none' 
          : `twinkle 4s ease-in-out infinite ${star.animationDelay}`,
      }}
    />
  );
}

export default function StarField({ isZeroGravity }: { isZeroGravity?: boolean }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Media query removed to avoid SSR/legacy browser crashes
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for buttery parallax
  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 40 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 40 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [prefersReducedMotion, mouseX, mouseY]);
  
  const stars = useMemo(() => {
    const random = seededRandom(42);
    const numStars = 150;
    const generatedStars: StarData[] = [];
    
    for (let i = 0; i < numStars; i++) {
      generatedStars.push({
        id: i,
        top: `${random() * 100}%`,
        left: `${random() * 100}%`,
        size: `${random() * 2 + 1}px`, // 1px to 3px
        animationDelay: `${random() * 4}s`,
        opacity: random() * 0.5 + 0.3, // 0.3 to 0.8
        parallaxMultiplier: random() * 20 + 5, 
      });
    }
    
    return generatedStars;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
      <motion.div
        animate={isZeroGravity ? { y: ["0%", "-50%"] } : { y: "0%" }}
        transition={isZeroGravity ? { repeat: Infinity, duration: 1, ease: "linear" } : { type: "spring", damping: 15, stiffness: 100 }}
        className="w-full h-full flex items-center justify-center"
      >
        <motion.div 
          className="relative w-[150vmax] h-[200vmax]"
          animate={prefersReducedMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={{ repeat: Infinity, duration: 240, ease: "linear" }}
        >
          {stars.map((star) => (
            <Star 
              key={star.id} 
              star={star} 
              smoothX={smoothX} 
              smoothY={smoothY} 
              prefersReducedMotion={prefersReducedMotion} 
            />
          ))}
          {/* Duplicate stars below for seamless looping when falling */}
          {stars.map((star) => (
            <Star 
              key={`dup-${star.id}`} 
              star={{ ...star, top: `calc(${star.top} + 100%)` }} 
              smoothX={smoothX} 
              smoothY={smoothY} 
              prefersReducedMotion={prefersReducedMotion} 
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
