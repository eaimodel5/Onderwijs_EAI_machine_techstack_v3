import React, { useEffect, useState } from 'react';
import Icon from './Icon';
import type dynamicIconImports from 'lucide-react/dynamicIconImports';

interface EmotionPulseProps {
  emotion: string;
  icon: keyof typeof dynamicIconImports;
  gradientClass: string;
  onComplete?: () => void;
}

export const EmotionPulse: React.FC<EmotionPulseProps> = ({ 
  emotion, 
  icon, 
  gradientClass,
  onComplete 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="relative">
        {/* Outer pulse rings */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradientClass} opacity-30 animate-ping`} 
             style={{ width: '120px', height: '120px', margin: '-10px' }} />
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradientClass} opacity-20 animate-pulse`} 
             style={{ width: '140px', height: '140px', margin: '-20px', animationDelay: '0.2s' }} />
        
        {/* Center icon */}
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-glow spring`}>
          <Icon name={icon} className="text-white" size={48} />
        </div>
        
        {/* Emotion label */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="glass-strong px-4 py-2 rounded-full text-sm font-semibold text-foreground shadow-elegant">
            {emotion}
          </span>
        </div>
      </div>
    </div>
  );
};
