"use client";

import { useRef, useState, useEffect } from "react";
import { buildingsConfig } from "@/lib/buildingsConfig";
import Building from "./Building";
import ScrollArrows from "./ScrollArrows";
import { motion } from "framer-motion";

interface SkylineProps {
  onBuildingSelect: (id: string, rect?: DOMRect) => void;
  activeBuildingId: string | null;
  isZeroGravity?: boolean;
}

export default function Skyline({ onBuildingSelect, activeBuildingId, isZeroGravity }: SkylineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedId, setFocusedId] = useState<string | null>(activeBuildingId);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Sync external active state to local focused state
  useEffect(() => {
    if (activeBuildingId) {
      setFocusedId(activeBuildingId);
      const el = document.getElementById(`building-${activeBuildingId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", inline: "center" });
      }
    }
  }, [activeBuildingId]);

  // Intersection Observer to detect centered building
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0;
        let mostVisibleId = null;
        
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisibleId = entry.target.id.replace('building-', '');
          }
        });
        
        if (mostVisibleId && maxRatio > 0.5) {
          setFocusedId(mostVisibleId);
        }
      },
      {
        root: containerRef.current,
        threshold: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      }
    );

    const children = containerRef.current.children;
    for (let i = 0; i < children.length; i++) {
      if (children[i].id.startsWith('building-')) {
        observer.observe(children[i]);
      }
    }

    return () => observer.disconnect();
  }, []);

  // Custom Smooth Scrolling Logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isZeroGravity) return; // Disable custom scroll in zero gravity

    let targetScroll = container.scrollLeft;
    let currentScroll = container.scrollLeft;
    let animationFrameId: number;

    const smoothScroll = () => {
      // Interpolate towards the target (lower multiplier = slower/smoother)
      currentScroll += (targetScroll - currentScroll) * 0.05;
      
      if (Math.abs(targetScroll - currentScroll) > 0.5) {
        container.scrollLeft = currentScroll;
        animationFrameId = requestAnimationFrame(smoothScroll);
      } else {
        container.scrollLeft = targetScroll;
        currentScroll = targetScroll;
      }
    };

    const handleNativeWheel = (e: WheelEvent) => {
      // We only want to hijack vertical mouse wheel scrolling
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault(); // Prevent default jagged scroll
        
        // Update current scroll to actual scroll left before adding new delta, 
        // in case the user dragged or focused a building.
        if (Math.abs(container.scrollLeft - currentScroll) > 10) {
          currentScroll = container.scrollLeft;
          targetScroll = container.scrollLeft;
        }

        // Add delta, but reduce speed (e.g., 0.4x) for "slow and smooth" feel
        targetScroll += e.deltaY * 0.6;
        
        // Clamp target scroll to boundaries
        const maxScroll = container.scrollWidth - container.clientWidth;
        targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
        
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(smoothScroll);
      }
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleNativeWheel);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isZeroGravity]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZeroGravity) return;
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current || isZeroGravity) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className={`relative w-full flex-1 flex items-end overflow-hidden mt-20 mb-16 transition-opacity duration-1000`}>
      {/* Left Fade */}
      <div className={`absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-city-bg to-transparent z-20 pointer-events-none transition-opacity duration-1000 ${isZeroGravity ? 'opacity-0' : 'opacity-100'}`} />
      
      <div 
        ref={containerRef}
        className={`w-full flex items-end gap-16 px-[50vw] pb-12 overflow-x-auto no-scrollbar h-full ${
          isZeroGravity ? 'pointer-events-none' : (isDragging ? 'cursor-grabbing select-none' : 'cursor-grab')
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        tabIndex={0}
        role="region"
        aria-label="City Skyline Navigation"
      >
        {buildingsConfig.map((config, index) => {
          // Generate deterministic random values based on index so they don't jump on re-render
          const randYHover = -100 - (index * 20); // Float slightly up
          const randXDrift = (index % 2 === 0 ? 1 : -1) * (100 + index * 20);
          const randRotSpin = (index % 3 === 0 ? 1 : -1) * (90 + index * 10);
          
          return (
            <motion.div 
              id={`building-${config.id}`} 
              key={config.id} 
              className={`snap-center shrink-0 flex items-end h-full relative ${isZeroGravity ? 'z-50' : ''}`}
              initial={{ y: 60, opacity: 0 }}
              animate={
                isZeroGravity 
                  ? { 
                      y: [0, randYHover, randYHover * 0.8, randYHover * 1.2], 
                      x: [0, randXDrift * 0.5, randXDrift, randXDrift * 1.5], 
                      rotate: [0, randRotSpin * 0.5, randRotSpin, randRotSpin * 1.5],
                    } 
                  : { y: 0, x: 0, rotate: 0, opacity: 1 }
              }
              transition={
                isZeroGravity 
                  ? { repeat: Infinity, duration: 8 + index * 0.5, ease: "linear" } 
                  : { type: "spring", damping: 14, stiffness: 100, delay: index * 0.05 }
              }
            >
              <div className="pointer-events-auto">
                <Building
                  config={config}
                  isFocused={focusedId === config.id && !isZeroGravity}
                  onClick={(e) => {
                    if (!isZeroGravity) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      onBuildingSelect(config.id, rect);
                    }
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Right Fade */}
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-city-bg to-transparent z-20 pointer-events-none" />
      
      {/* Grass and Land Base */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-12 z-10 pointer-events-none flex flex-col"
        animate={isZeroGravity ? { y: 200, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeIn" }}
      >
        {/* Grass top layer with blade details */}
        <div className="w-full h-3 bg-[#1c3826] border-t-2 border-[#2b5238] relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-50" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grass-pattern" width="30" height="12" patternUnits="userSpaceOnUse">
                {/* Darker blades */}
                <path d="M4,12 L4,6 L5,6 L5,12 Z" fill="#122619" />
                <path d="M16,12 L16,8 L17,8 L17,12 Z" fill="#122619" />
                {/* Lighter highlight blades */}
                <path d="M10,12 L10,7 L11,7 L11,12 Z" fill="#2b5238" />
                <path d="M25,12 L25,5 L26,5 L26,12 Z" fill="#2b5238" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grass-pattern)" />
          </svg>
        </div>
        
        {/* Deep earth layer with rock/dirt details */}
        <div className="w-full flex-1 bg-[#0d1410] relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dirt-pattern" width="60" height="36" patternUnits="userSpaceOnUse">
                {/* Scattered rocks and dirt clods */}
                <rect x="8" y="10" width="3" height="2" fill="#18261e" />
                <rect x="25" y="6" width="2" height="1" fill="#18261e" />
                <rect x="42" y="15" width="4" height="2" fill="#090d0b" />
                <rect x="15" y="24" width="2" height="3" fill="#090d0b" />
                <rect x="35" y="28" width="5" height="2" fill="#18261e" />
                <rect x="52" y="22" width="2" height="2" fill="#18261e" />
                <rect x="5" y="30" width="1" height="1" fill="#2b5238" opacity="0.3" /> {/* Root speck */}
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dirt-pattern)" />
          </svg>
        </div>
      </motion.div>

      <ScrollArrows containerRef={containerRef} />
    </div>
  );
}
