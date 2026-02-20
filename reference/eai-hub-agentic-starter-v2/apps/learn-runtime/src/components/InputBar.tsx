
import React, { useRef } from "react";
import { Send } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";

const InputBar: React.FC<{
  value: string;
  onChange: (val: string) => void;
  onSend: (message: string) => void;
  disabled?: boolean;
}> = ({ value, onChange, onSend, disabled }) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  // Enter key verzenden, Ctrl+Enter voor nieuwe regel
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend(value);
    }
    // Ctrl+Enter of Shift+Enter voor nieuwe regel (default gedrag)
  };

  return (
    <form
      className={`flex gap-3 items-end glass-strong rounded-2xl border border-border/30 mx-auto w-full transition-all duration-300 focus-within:border-primary-purple/40 focus-within:shadow-glow-sm ${
        isMobile 
          ? 'px-3 py-2.5 my-2' 
          : 'px-4 py-3 my-3'
      }`}
      onSubmit={e => {
        e.preventDefault();
        if (!disabled && value.trim()) onSend(value);
      }}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <textarea
        ref={ref}
        rows={1}
        className={`resize-none w-full border-none bg-transparent outline-none p-0 min-h-[32px] max-h-[100px] font-inter flex-1 leading-relaxed placeholder:text-muted-foreground/60`}
        placeholder="Vertel wat je voelt…"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        aria-label="Typ je gevoel"
        style={{ 
          fontSize: '16px', // Fixed font-size to prevent zoom on iOS
          lineHeight: '1.5'
        }}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className={`rounded-xl bg-gradient-to-br from-primary-coral to-primary-purple hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:shadow-none flex-shrink-0 group ${
          isMobile 
            ? 'ml-1 p-2.5' 
            : 'ml-1 p-2.5'
        }`}
        aria-label="Verzenden"
      >
        <Send size={18} className="text-white group-hover:scale-110 transition-transform duration-300" />
      </button>
    </form>
  );
};

export default InputBar;
