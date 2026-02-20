import React from 'react';

export const TypingIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2 px-4 py-3 ${className}`}>
      <div className="flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-coral to-primary-purple animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-coral to-primary-purple animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-coral to-primary-purple animate-bounce" />
      </div>
      <span className="text-xs text-muted-foreground ml-1">EvAI denkt na...</span>
    </div>
  );
};
