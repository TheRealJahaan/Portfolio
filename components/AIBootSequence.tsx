"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const bootLines = [
  "Initializing Quantum Core...",
  "Connecting Neural Network...",
  "Detecting Visitor...",
  "Loading Parallel Timelines...",
  "Stabilizing Reality...",
  "Identity Found."
];

export default function AIBootSequence({ onComplete }: { onComplete: () => void }) {
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [showName, setShowName] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    // Start sequence after a brief moment of silence
    const startDelay = setTimeout(() => {
      setCurrentLineIndex(0);
    }, 1500);

    return () => clearTimeout(startDelay);
  }, []);

  useEffect(() => {
    if (currentLineIndex >= 0 && currentLineIndex < bootLines.length) {
      // Type each line with a slight variable delay
      const nextLineDelay = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
      }, 400 + Math.random() * 300);
      return () => clearTimeout(nextLineDelay);
    } else if (currentLineIndex === bootLines.length) {
      // Show Name
      const nameDelay = setTimeout(() => {
        setShowName(true);
      }, 800);
      return () => clearTimeout(nameDelay);
    }
  }, [currentLineIndex]);

  useEffect(() => {
    if (showName) {
      // Flash and complete
      const flashDelay = setTimeout(() => {
        setIsFlashing(true);
        setTimeout(onComplete, 800); // Wait for flash to cover screen before unmounting
      }, 2000);
      return () => clearTimeout(flashDelay);
    }
  }, [showName, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-[#030712] flex flex-col justify-center px-12 md:px-24 font-mono text-[#22D3EE] cursor-none overflow-hidden"
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col gap-2 max-w-3xl">
        {bootLines.map((line, index) => (
          <AnimatePresence key={index}>
            {index <= currentLineIndex && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm md:text-base opacity-80"
              >
                {">"} {line}
              </motion.div>
            )}
          </AnimatePresence>
        ))}

        {/* Blinking Cursor while typing */}
        {!showName && (
          <motion.div
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-3 h-5 bg-[#22D3EE] mt-2"
          />
        )}
      </div>

      <AnimatePresence>
        {showName && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4"
          >
            <div className="text-4xl md:text-7xl font-bold tracking-[0.5em] text-white drop-shadow-[0_0_30px_rgba(34,211,238,0.8)] text-center pl-[0.5em]">
              JAHAAN SUTHAR
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-[#94A3B8] font-mono tracking-widest text-sm md:text-base"
            >
              Software Engineer
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Flash Bang */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeIn" }}
            className="absolute inset-0 bg-white z-[201]"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
