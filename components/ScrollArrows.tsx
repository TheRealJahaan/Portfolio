"use client";

import { useEffect, useState, RefObject } from "react";

export default function ScrollArrows({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Hide on touch devices
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (!isTouch) {
      setShow(true);
    }
  }, []);

  const scrollByAmount = (amount: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  if (!show) return null;

  return (
    <>
      <button
        onClick={() => scrollByAmount(-400)}
        aria-label="Scroll left"
        className="absolute left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-city-panel/50 border border-city-panelBorder text-white/50 hover:text-white hover:bg-city-panel hover:scale-110 transition-all backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      
      <button
        onClick={() => scrollByAmount(400)}
        aria-label="Scroll right"
        className="absolute right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-city-panel/50 border border-city-panelBorder text-white/50 hover:text-white hover:bg-city-panel hover:scale-110 transition-all backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </>
  );
}
