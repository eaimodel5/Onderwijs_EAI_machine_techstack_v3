import React, { useRef } from 'react';
import Icon from './Icon';
import { cn } from '@/lib/utils';
import type dynamicIconImports from 'lucide-react/dynamicIconImports';

interface EmotionTimelineItem {
  id: string;
  icon: keyof typeof dynamicIconImports;
  label: string;
  gradientClass: string;
  time: string;
}

interface EmotionTimelineProps {
  history: EmotionTimelineItem[];
  onFocus?: (id: string) => void;
  className?: string;
}

export const EmotionTimeline: React.FC<EmotionTimelineProps> = ({ 
  history, 
  onFocus,
  className = '' 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (history.length === 0) return null;

  const handleClick = (id: string) => {
    onFocus?.(id);
  };

  return (
    <div className={cn("glass-strong border-b border-border/50 py-3 px-4 overflow-hidden", className)}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Emotie Tijdlijn
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
        </div>
        
        <div 
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
          style={{ scrollBehavior: 'smooth' }}
        >
          {history.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={cn(
                "flex-shrink-0 group relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-glow-sm",
                "bg-gradient-to-br",
                item.gradientClass
              )}
              title={`${item.label} · ${item.time}`}
            >
              <Icon name={item.icon} className="text-white drop-shadow-md" size={20} />
              <span className="text-[10px] font-medium text-white/90 whitespace-nowrap">
                {item.time}
              </span>
              
              {/* Connecting line */}
              {index < history.length - 1 && (
                <div className="absolute left-full top-1/2 w-2 h-0.5 bg-border/30 -translate-y-1/2" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
