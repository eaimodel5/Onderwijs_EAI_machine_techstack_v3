
import React from "react";
import Icon from "./Icon";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

import type dynamicIconImports from 'lucide-react/dynamicIconImports';

interface EmotionHistoryItem {
  id: string;
  icon: keyof typeof dynamicIconImports;
  label: string;
  colorClass: string;
  time: string;
}

const SidebarEmotionHistory: React.FC<{
  history?: EmotionHistoryItem[];
  onFocus?: (id: string) => void;
  onClear?: () => void;
  className?: string;
}> = ({ history = [], onFocus, onClear, className = "" }) => {
  const isFlexRow = className?.includes('flex-row');
  
  return (
    <aside
      className={cn(
        "flex glass-strong border-border/30 sticky overflow-y-auto backdrop-blur-xl",
        isFlexRow 
          ? "flex-row flex-wrap justify-center items-start gap-4 p-4" 
          : "flex-col justify-between w-20 py-6 px-2 border-r min-h-[calc(100vh-56px)] top-14 h-[calc(100vh-56px)]",
        className
      )}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className={cn(
        "flex items-center",
        isFlexRow ? "flex-row flex-wrap justify-center gap-4 w-full" : "flex-col gap-4"
      )}>
        {history.map((item) => (
          <button
            key={item.id}
            className={`relative group flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 border-white ${item.colorClass} hover:shadow-glow-sm focus:outline-none transition-all duration-300 hover:scale-110 hover:-translate-y-1`}
            title={`${item.label} · ${item.time}`}
            onClick={() => onFocus?.(item.id)}
            aria-label={`${item.label} om ${item.time}`}
          >
            <Icon name={item.icon} className="text-white drop-shadow-md" size={32} />
            <span className={cn(
              "absolute text-xs opacity-0 group-hover:opacity-100 glass-strong text-foreground rounded-lg px-3 py-1.5 duration-200 pointer-events-none z-10 shadow-elegant font-medium",
              isFlexRow 
                ? "-top-10 left-1/2 -translate-x-1/2" 
                : "-bottom-10 left-1/2 -translate-x-1/2"
            )}>
              {item.label} · {item.time}
            </span>
          </button>
        ))}
      </div>
      
        {onClear && (
        <div className={cn(
          "flex justify-center",
          isFlexRow ? "w-full pt-4" : "mt-auto pt-4"
        )}>
          <button
            onClick={onClear}
            className="relative group flex items-center justify-center w-14 h-14 rounded-2xl border-2 border-border/30 hover:border-destructive/50 glass hover:glass-strong transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-destructive/40 hover:scale-105 hover:shadow-glow-sm"
            title="Wis geschiedenis"
            aria-label="Wis de volledige chatgeschiedenis"
          >
            <Trash2 className="text-muted-foreground group-hover:text-destructive transition-colors" size={24} />
            <span className={cn(
              "absolute text-xs opacity-0 group-hover:opacity-100 glass-strong px-3 py-1.5 rounded-lg shadow-elegant font-medium pointer-events-none z-10",
              isFlexRow 
                ? "-top-10 left-1/2 -translate-x-1/2" 
                : "-bottom-10 left-1/2 -translate-x-1/2"
            )}>
              Wis alles
            </span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default SidebarEmotionHistory;
