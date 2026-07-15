"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import MagneticButton from "./MagneticButton";

export default function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const [isEntering, setIsEntering] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Cinematic Sequence Timing
    const t1 = setTimeout(() => setStep(1), 3500);
    const t2 = setTimeout(() => setStep(2), 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleEnter = () => {
    setIsEntering(true);
    // Wait for the cosmic zoom animation to finish before removing the screen
    setTimeout(onComplete, 1200); 
  };

  const title = "Jahaan's World.";

  return (
    <motion.div
      key="welcome"
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-city-bg overflow-hidden"
    >
      {/* The Cosmic Core / Background Rings */}
      <motion.div 
        className="absolute w-[60vw] h-[60vw] min-w-[600px] min-h-[600px] rounded-full border border-white/5 opacity-50"
        animate={isEntering ? { scale: 5, opacity: 0 } : { scale: 1, rotate: 360 }}
        transition={isEntering ? { duration: 1.2, ease: "anticipate" } : { repeat: Infinity, duration: 40, ease: "linear" }}
      />
      <motion.div 
        className="absolute w-[40vw] h-[40vw] min-w-[400px] min-h-[400px] rounded-full border border-white/10 opacity-70"
        animate={isEntering ? { scale: 8, opacity: 0 } : { scale: 1, rotate: -360 }}
        transition={isEntering ? { duration: 1.2, ease: "anticipate" } : { repeat: Infinity, duration: 25, ease: "linear" }}
      />
      
      {/* Central Cosmic Glow */}
      <motion.div 
        className="absolute w-[200px] h-[200px] rounded-full bg-[#3b5aa8]/30 blur-[80px]"
        animate={isEntering ? { scale: 20, opacity: 0 } : { scale: [1, 1.2, 1] }}
        transition={isEntering ? { duration: 1, ease: "easeIn" } : { repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />

      <motion.div
        animate={isEntering ? { scale: 3, opacity: 0, filter: "blur(10px)" } : { scale: 1, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: "anticipate" }}
        className="relative z-10 flex flex-col items-center justify-center min-h-[300px]"
      >
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="font-mono text-lg md:text-xl tracking-[0.4em] text-white/60 uppercase text-center absolute"
            >
              A Jahaan Suthar Production
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="font-mono text-lg md:text-xl tracking-[0.4em] text-white/60 uppercase text-center absolute"
            >
              An Interactive Experience
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="font-mono text-4xl md:text-6xl font-bold tracking-tight text-center px-6 mb-12 leading-tight flex flex-col items-center">
                <div className="overflow-hidden mb-2">
                  <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    className="text-white/80 text-2xl md:text-4xl"
                  >
                    Welcome to
                  </motion.div>
                </div>
                <div className="flex overflow-hidden pb-4 px-2">
                  {title.split("").map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ y: "100%", opacity: 0, filter: "blur(10px)" }}
                      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                      transition={{ 
                        duration: 0.8, 
                        ease: [0.76, 0, 0.24, 1],
                        delay: 0.3 + index * 0.05 
                      }}
                      className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#3d8bc9] to-[#7b3fa0]"
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <MagneticButton
                  onClick={handleEnter}
                  className="px-8 py-4 rounded-full border border-white/20 text-white font-mono uppercase tracking-widest text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white bg-city-panel/50 backdrop-blur-md cursor-none hover:bg-white/10"
                >
                  Begin Tour
                </MagneticButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
