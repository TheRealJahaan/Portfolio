"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { buildingsConfig } from "@/lib/buildingsConfig";

interface SectionDrawerProps {
  isOpen: boolean;
  activeBuildingId: string | null;
  onClose: () => void;
}

export default function SectionDrawer({ isOpen, activeBuildingId, onClose }: SectionDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap (basic focus set)
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [isOpen]);

  const activeConfig = buildingsConfig.find(b => b.id === activeBuildingId);

  return (
    <AnimatePresence>
      {isOpen && activeConfig && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-city-bg/70 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Drawer panel */}
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeConfig.label} Section`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 h-[75vh] bg-city-panel border-t border-city-panelBorder rounded-t-3xl z-50 shadow-2xl flex flex-col focus:outline-none"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-city-panelBorder shrink-0">
              <h2 className="font-mono text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: `var(--tw-color-${activeConfig.colorToken})` }}
                  // Fallback if var doesn't map directly
                  // For safety, we can just use bg class, but since we are in dynamic rendering,
                  // we can just use the mapped colors from earlier or just rely on the label
                />
                <div className={`w-3 h-3 rounded-full bg-${activeConfig.colorToken}`} />
                {activeConfig.label}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close section"
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 no-scrollbar">
              <div className="max-w-4xl mx-auto h-full flex flex-col items-center justify-center text-white/50 font-mono text-center">
                <p className="mb-4 text-xl">[{activeConfig.id.toUpperCase()}_SECTION_CONTENT]</p>
                <p className="text-sm max-w-md">{activeConfig.description}</p>
                <p className="mt-8 text-xs text-white/30">Real content will be wired up here in Phase 3.</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
