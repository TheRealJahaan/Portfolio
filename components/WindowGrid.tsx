import { useMemo } from "react";
import { seededRandom } from "@/lib/seededRandom";
import { cn } from "@/lib/utils";

interface WindowGridProps {
  cols: number;
  rows: number;
  buildingId: string;
  litWindows?: boolean[][]; // [col][row] where col is x and row is y
}

export default function WindowGrid({ cols, rows, buildingId, litWindows }: WindowGridProps) {
  // Generate random window pattern if no litWindows provided
  const randomPattern = useMemo(() => {
    if (litWindows) return null;
    
    // Convert string buildingId to a simple numerical seed
    let seed = 0;
    for (let i = 0; i < buildingId.length; i++) {
      seed += buildingId.charCodeAt(i);
    }
    
    const random = seededRandom(seed);
    const pattern = Array.from({ length: cols }, () =>
      Array.from({ length: rows }, () => random() > 0.4) // 60% chance of being lit
    );
    return pattern;
  }, [cols, rows, buildingId, litWindows]);

  const activePattern = litWindows || randomPattern;

  if (!activePattern) return null;

  return (
    <div 
      className="grid gap-[3px] p-2 h-full w-full opacity-90"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`row-${r}`} className="contents">
          {Array.from({ length: cols }).map((_, c) => {
            const isLit = activePattern[c]?.[r] ?? false;
            return (
              <div
                key={`win-${c}-${r}`}
                className={cn(
                  "w-full h-full rounded-[1px] transition-colors duration-500",
                  isLit ? "bg-window-lit" : "bg-window-unlit"
                )}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
