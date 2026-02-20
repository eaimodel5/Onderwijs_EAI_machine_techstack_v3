import React from 'react';
import { Heart, Brain, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export const EmptyState: React.FC<{ onPromptClick?: (prompt: string) => void }> = ({ onPromptClick }) => {
  const starterPrompts = [
    "Ik voel me gestrest door...",
    "Ik wil graag praten over...",
    "Help me reflecteren op..."
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4 py-12 animate-fade-in">
      {/* Animated illustration */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-coral/20 to-primary-purple/20 blur-3xl animate-pulse" />
        <div className="relative flex gap-4 items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-coral to-primary-purple flex items-center justify-center shadow-glow animate-bounce">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <Sparkles className="h-6 w-6 text-primary-purple animate-pulse" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary-teal to-primary-purple flex items-center justify-center shadow-glow-sm" style={{ animationDelay: '0.2s' }}>
            <Brain className="h-8 w-8 text-white animate-pulse" />
          </div>
        </div>
      </div>

      {/* Welcome text */}
      <h2 className="text-2xl font-display font-bold gradient-text mb-3">
        Welkom bij EvAI
      </h2>
      <p className="text-muted-foreground text-base mb-8 max-w-md">
        Je empathische AI-partner die je helpt met emoties, reflectie en persoonlijke groei
      </p>

      {/* Starter prompts */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Begin met een van deze vragen:
        </span>
        {starterPrompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            className="glass hover:glass-strong hover:scale-105 transition-all duration-300 text-left justify-start h-auto py-3 px-4"
            onClick={() => onPromptClick?.(prompt)}
          >
            <span className="text-sm font-medium">{prompt}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
