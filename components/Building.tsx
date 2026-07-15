import { BuildingConfig } from "@/lib/buildingsConfig";
import WindowGrid from "./WindowGrid";
import { cn } from "@/lib/utils";

interface BuildingProps {
  config: BuildingConfig;
  isFocused: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

const bgMap: Record<string, string> = {
  "building-about": "bg-building-about",
  "building-skills": "bg-building-skills",
  "building-ios": "bg-building-ios",
  "building-projects": "bg-building-projects",
  "building-github": "bg-building-github",
  "building-blog": "bg-building-blog",
  "building-contact": "bg-building-contact",
  "building-resume": "bg-building-resume",
};

// Also map shadow colors for the glow
const shadowMap: Record<string, string> = {
  "building-about": "shadow-[#3b5aa8]",
  "building-skills": "shadow-[#5a4fcf]",
  "building-ios": "shadow-[#3ea36b]",
  "building-projects": "shadow-[#d98a2b]",
  "building-github": "shadow-[#7b3fa0]",
  "building-blog": "shadow-[#c9a227]",
  "building-contact": "shadow-[#3d8bc9]",
  "building-resume": "shadow-[#c94b4b]",
};

export default function Building({ config, isFocused, onClick, children }: BuildingProps) {
  const bgClass = bgMap[config.colorToken] || "bg-city-panel";
  const shadowClass = shadowMap[config.colorToken] || "shadow-white";

  return (
    <button
      onClick={onClick}
      aria-label={`Open ${config.label} section`}
      data-cursor-hover="true"
      className={cn(
        "relative flex flex-col items-center justify-end group transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-city-bg flex-shrink-0 snap-center pb-4",
        isFocused ? "opacity-100 scale-105 z-10" : "opacity-60 scale-100 z-0 hover:opacity-80"
      )}
      style={{ 
        height: `${config.heightPx + 16}px`, // +16 for the pb-4 (ground level)
        width: `${config.windowCols * 14 + 16}px`, 
      }}
    >
      <div 
        className={cn(
          "w-full h-full rounded-t-md border-t border-l border-r border-white/20 overflow-hidden relative transition-shadow duration-500 flex flex-col items-center",
          bgClass,
          isFocused ? `shadow-[0_0_40px_-10px_var(--tw-shadow-color)] ${shadowClass}` : ""
        )}
      >
        <div 
          className={cn(
            "pt-3 pb-2 w-full text-center whitespace-nowrap text-white font-mono text-sm tracking-wider transition-opacity duration-300 z-10 bg-gradient-to-b from-black/50 to-transparent",
            isFocused ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          {config.label}
        </div>

        <div className="flex-1 w-full flex flex-col justify-end">
          {children || (
            <WindowGrid 
              cols={config.windowCols} 
              rows={config.windowRows} 
              buildingId={config.id} 
            />
          )}
        </div>
      </div>
      
      {/* Ground platform / base for realism */}
      <div className="absolute bottom-0 w-[110%] h-4 bg-city-panel border-t border-city-panelBorder rounded-t-sm z-20" />
    </button>
  );
}
