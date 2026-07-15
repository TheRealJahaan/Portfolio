"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import Skyline from "./Skyline";
import StarField from "./StarField";
import SectionContainer from "./sections/SectionContainer";
import CursorStar from "./CursorStar";

export default function CityShell() {
  const [activeBuildingId, setActiveBuildingId] = useState<string | null>(null);
  const [zoomRect, setZoomRect] = useState<DOMRect | null>(null);
  const [isZeroGravity, setIsZeroGravity] = useState(false);

  const handleBuildingSelect = (id: string, rect?: DOMRect) => {
    if (isZeroGravity) return;
    setActiveBuildingId(id);
    
    if (rect) {
      setZoomRect(rect);
    } else {
      const el = document.getElementById(`building-${id}`);
      if (el) {
        setZoomRect(el.getBoundingClientRect());
      }
    }
  };

  const handleExitBuilding = () => {
    setActiveBuildingId(null);
    setZoomRect(null);
  };

  const S = 10; // Zoom scale factor
  const targetX = zoomRect && typeof window !== 'undefined' ? (window.innerWidth / 2) - (zoomRect.left + zoomRect.width / 2) * S : 0;
  const targetY = zoomRect && typeof window !== 'undefined' ? (window.innerHeight / 2) - (zoomRect.top + zoomRect.height / 2) * S : 0;

  return (
    <main className={`relative min-h-screen w-full overflow-hidden flex flex-col justify-center cursor-default transition-colors duration-1000 ${isZeroGravity ? 'bg-red-950/20' : ''}`}>
      <CursorStar />
      
      {/* Zoom Wrapper */}
      <motion.div
        className="absolute inset-0 origin-top-left"
        initial={{ scale: 1, x: 0, y: 0 }}
        animate={
          zoomRect && activeBuildingId
            ? {
                scale: S,
                x: targetX,
                y: targetY,
                filter: "blur(15px) brightness(0.2)",
              }
            : {
                scale: 1,
                x: 0,
                y: 0,
                filter: "blur(0px) brightness(1)",
              }
        }
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <StarField isZeroGravity={isZeroGravity} />
        <TopBar isZeroGravity={isZeroGravity} toggleGravity={() => setIsZeroGravity(!isZeroGravity)} />
        
        <div className="absolute inset-0 flex flex-col">
          <Skyline 
            activeBuildingId={activeBuildingId} 
            onBuildingSelect={handleBuildingSelect} 
            isZeroGravity={isZeroGravity}
          />
        </div>
      </motion.div>
      
      {/* Fade out bottom nav when zoomed in */}
      <motion.div 
        animate={{ opacity: activeBuildingId ? 0 : 1, y: activeBuildingId ? 20 : 0 }}
        transition={{ duration: 0.5 }}
        className={`pointer-events-${activeBuildingId ? 'none' : 'auto'} z-40`}
      >
        <BottomNav 
          activeBuildingId={activeBuildingId} 
          onSelect={handleBuildingSelect} 
        />
      </motion.div>

      <SectionContainer 
        activeBuildingId={activeBuildingId} 
        onClose={handleExitBuilding} 
      /> 
    </main>
  );
}
