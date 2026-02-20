
import React, { forwardRef, useState } from "react";
import { Gem, CornerDownRight, ThumbsUp, ThumbsDown, Sparkles, BookOpen, Zap, Scale, Brain, PieChart, Shield, AlertTriangle } from "lucide-react";
import AITransparencyTooltip from "./AITransparencyTooltip";
import { ContextualHelp } from "./ContextualHelp";
import { TransparencyPanel } from "./TransparencyPanel";

interface ChatBubbleProps {
  id: string;
  from: "user" | "ai";
  label: "Valideren" | "Reflectievraag" | "Suggestie" | "Fout" | null;
  accentColor?: string;
  children: React.ReactNode;
  meta?: React.ReactNode | { gapAnalysis?: string; [key: string]: any };
  explainText?: string;
  emotionSeed?: string;
  animate?: boolean;
  brilliant?: boolean;
  isFocused?: boolean;
  repliedToContent?: string;
  feedback?: "like" | "dislike" | null;
  symbolicInferences?: string[];
  v20Metadata?: {
    tdMatrixFlag?: string;
    fusionStrategy?: string;
    safetyScore?: number;
    eaaScores?: { ownership: number; autonomy: number; agency: number };
  };
  onFeedback?: (feedback: "like" | "dislike") => void;
}

const LABEL_CLASSES = {
  Valideren: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  Reflectievraag: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  Suggestie: "bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  Fout: "bg-destructive/10 text-destructive dark:bg-destructive/20",
};

const ChatBubble = forwardRef<HTMLDivElement, ChatBubbleProps>(({ 
  id,
  from,
  label,
  accentColor,
  children,
  meta,
  explainText,
  emotionSeed,
  animate,
  brilliant,
  isFocused,
  repliedToContent,
  feedback,
  symbolicInferences,
  v20Metadata,
  onFeedback,
}, ref) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [shaking, setShaking] = useState(false);
  
  const bubbleStyles =
    from === "user"
      ? "bg-gradient-to-br from-primary-coral to-primary-purple text-white border-0"
      : accentColor
      ? ""
      : "glass text-foreground border border-primary-purple/10";

  // Extract gap analysis from meta if it's an object
  const gapAnalysis = typeof meta === 'object' && meta && 'gapAnalysis' in meta 
    ? meta.gapAnalysis 
    : undefined;

  const handleFeedback = (type: 'like' | 'dislike') => {
    if (type === 'like') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    } else {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(type === 'like' ? 50 : [30, 20, 30]);
    }
    
    onFeedback?.(type);
  };

  return (
    <div
      ref={ref}
      className={`flex flex-col items-start gap-1 mb-4 ${from === "user" ? "items-end" : "items-start"} ${
        animate ? "animate-fade-in" : ""
      }`}
      data-seed={emotionSeed}
    >
      {from === "ai" && label && (
        <div className="mb-2 ml-2 flex items-center gap-1.5 flex-wrap">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium tracking-wide ${LABEL_CLASSES[label] ?? "bg-muted text-muted-foreground"}`}
          >
            {label}
          </span>
          {v20Metadata?.tdMatrixFlag && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium glass-strong border border-primary-purple/20 text-foreground flex items-center gap-1.5">
              {v20Metadata.tdMatrixFlag === 'DIDACTIC' ? (
                <><BookOpen className="h-3 w-3" /> Didactisch</>
              ) : v20Metadata.tdMatrixFlag === 'AUTONOMOUS' ? (
                <><Zap className="h-3 w-3" /> Autonoom</>
              ) : (
                <><Scale className="h-3 w-3" /> Balanced</>
              )}
            </span>
          )}
          {v20Metadata?.fusionStrategy && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium glass-strong border border-primary-purple/20 text-foreground flex items-center gap-1.5">
              {v20Metadata.fusionStrategy === 'neural_enhanced' ? (
                <><Brain className="h-3 w-3" /> Neural+</>
              ) : v20Metadata.fusionStrategy === 'weighted_blend' ? (
                <><PieChart className="h-3 w-3" /> Hybrid</>
              ) : (
                <><BookOpen className="h-3 w-3" /> Symbolic</>
              )}
            </span>
          )}
          {v20Metadata?.safetyScore !== undefined && v20Metadata.safetyScore < 0.5 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium glass-strong border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" /> Safety Review
            </span>
          )}
          <AITransparencyTooltip 
            label={label}
            reasoning={explainText}
            techniques={symbolicInferences}
            gapAnalysis={gapAnalysis}
          />
        </div>
      )}
      <div className={`relative w-fit max-w-[70vw]`}>
        {/* Brilliant/diamond sparkle */}
        {brilliant && (
          <span className="absolute -left-6 -top-2 z-10 animate-fade-in pointer-events-none">
            <Gem size={22} className="text-primary drop-shadow-brilliant" />
          </span>
        )}
        
        {/* Quoted reply */}
        {from === 'ai' && repliedToContent && (
          <div className="flex items-center gap-2 text-xs italic opacity-70 text-muted-foreground mb-1.5 ml-2">
            <CornerDownRight size={14} className="flex-shrink-0" />
            <p className="truncate">
              {repliedToContent}
            </p>
          </div>
        )}

        <div
          className={`px-5 py-4 rounded-2xl font-inter shadow-elegant relative text-sm leading-relaxed transition-all duration-300 hover:shadow-glow
            ${bubbleStyles}
            ${brilliant ? "ring-2 ring-primary-purple/30 ring-offset-2 shadow-glow" : ""}
            ${isFocused ? "ring-2 ring-yellow-400 ring-offset-2" : ""}
            ${from === "ai" && animate ? "spring" : ""}
            ${from === "user" ? "hover:scale-[1.02]" : ""}
            ${shaking ? "animate-shake" : ""}
          `}
          style={
            accentColor && from === "ai"
              ? { backgroundColor: accentColor, color: "#222" }
              : undefined
          }
          data-ttl={typeof meta === 'string' ? meta : undefined}
        >
          {children}
          
          {/* Confetti particles */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {[...Array(8)].map((_, i) => (
                <Sparkles
                  key={i}
                  className="absolute text-primary-purple animate-ping"
                  size={16}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 50}ms`,
                    animationDuration: '600ms'
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Feedback Toggle */}
          {from === 'ai' && onFeedback && (
            <div className="absolute -bottom-3 -right-2 flex items-center gap-2">
              <div className="flex items-center glass-strong border border-primary-purple/20 rounded-full shadow-elegant p-0.5">
                <button
                  onClick={() => handleFeedback('like')}
                  className={`p-1.5 rounded-full transition-all duration-200 ${
                    feedback === 'like' 
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white scale-110 shadow-glow-sm' 
                      : 'text-muted-foreground hover:bg-accent hover:scale-105'
                  }`}
                  aria-label="Antwoord is nuttig"
                >
                  <ThumbsUp size={14} />
                </button>
                <div className="w-px h-4 bg-border/50 mx-0.5" />
                <button
                  onClick={() => handleFeedback('dislike')}
                  className={`p-1.5 rounded-full transition-all duration-200 ${
                    feedback === 'dislike' 
                      ? 'bg-gradient-to-br from-red-400 to-rose-500 text-white scale-110 shadow-glow-sm' 
                      : 'text-muted-foreground hover:bg-accent hover:scale-105'
                  }`}
                  aria-label="Antwoord is niet nuttig"
                >
                  <ThumbsDown size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Transparency Panel */}
        {from === 'ai' && (v20Metadata || symbolicInferences) && (
          <div className="mt-3">
            <TransparencyPanel 
              v20Metadata={v20Metadata}
              symbolicInferences={symbolicInferences}
              explainText={explainText}
            />
          </div>
        )}
      </div>
    </div>
  );
});

ChatBubble.displayName = "ChatBubble";

export default ChatBubble;
