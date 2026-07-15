import { buildingsConfig } from "@/lib/buildingsConfig";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeBuildingId: string | null;
  onSelect: (id: string) => void;
}

export default function BottomNav({ activeBuildingId, onSelect }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-6 bg-gradient-to-t from-city-bg via-city-bg/90 to-transparent">
      <div className="max-w-4xl mx-auto flex gap-2 justify-center overflow-x-auto no-scrollbar snap-x snap-mandatory">
        {buildingsConfig.map((config) => (
          <button
            key={config.id}
            onClick={() => onSelect(config.id)}
            aria-label={`Go to ${config.label}`}
            className={cn(
              "snap-center shrink-0 px-5 py-2.5 rounded-full font-sans text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-city-bg border",
              activeBuildingId === config.id
                ? "bg-white text-city-bg border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                : "bg-city-panel/70 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
            )}
          >
            {config.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
