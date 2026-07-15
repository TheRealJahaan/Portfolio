"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import CityShell from "@/components/CityShell";
import WelcomeScreen from "@/components/WelcomeScreen";
import AIBootSequence from "@/components/AIBootSequence";

export default function App() {
  const [phase, setPhase] = useState<"boot" | "welcome" | "city">("boot");

  return (
    <>
      <AnimatePresence mode="wait">
        {phase === "boot" && <AIBootSequence key="boot" onComplete={() => setPhase("welcome")} />}
        {phase === "welcome" && <WelcomeScreen key="welcome" onComplete={() => setPhase("city")} />}
      </AnimatePresence>
      
      {phase === "city" && <CityShell />}
    </>
  );
}
