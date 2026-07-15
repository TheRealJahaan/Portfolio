import { Globe } from "lucide-react";

export default function TopBar({ isZeroGravity, toggleGravity }: { isZeroGravity?: boolean; toggleGravity?: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 p-6 flex justify-between items-center pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-center text-4xl drop-shadow-[0_0_15px_rgba(73,179,252,0.5)]" style={{ animation: "spinY 4s linear infinite" }}>
        🌎
      </div>
      <div className="flex items-center gap-6 pointer-events-auto">
        {toggleGravity && (
          <button 
            onClick={toggleGravity}
            data-cursor-hover="true"
            className={`font-mono text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-md transition-all duration-300 ${
              isZeroGravity 
                ? "bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
                : "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 hover:animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            }`}
          >
            {isZeroGravity ? "Restore Gravity" : "Do Not Press"}
          </button>
        )}
        <div className="text-white/60 font-mono text-sm hidden sm:block">
          PORTFOLIO / 2026
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spinY {
            from { transform: rotateY(0deg); }
            to { transform: rotateY(360deg); }
          }
        `}} />
      </div>
    </header>
  );
}
