import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Brain, Settings } from "lucide-react";
import { useBrowserTransformerEngine } from "@/hooks/useBrowserTransformerEngine";

interface TopBarProps {
  onSettingsClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onSettingsClick }) => {
  const navigate = useNavigate();
  const { device, modelLoaded } = useBrowserTransformerEngine();

  // 🔍 Debug logging voor Browser ML status
  useEffect(() => {
    console.log('🔴 TopBar: Browser ML status check', { 
      device, 
      modelLoaded,
      timestamp: new Date().toISOString()
    });
  }, [device, modelLoaded]);

  const handleLogoClick = () => {
    navigate('/admin');
  };

  const getBrowserMLStatus = () => {
    if (!modelLoaded) return { color: 'destructive' as const, text: 'Edge Only', icon: '🔴', description: '☁️ Browser ML niet beschikbaar - gebruikt Edge Functions' };
    if (device === 'webgpu') return { color: 'default' as const, text: 'WebGPU', icon: '🟢', description: '🚀 Lokale AI via WebGPU - snelste emotie-detectie!' };
    if (device === 'wasm') return { color: 'secondary' as const, text: 'WASM', icon: '🟡', description: '⚡ Lokale AI via WASM - iets trager maar privacy-vriendelijk' };
    return { color: 'secondary' as const, text: 'Loading...', icon: '⏳', description: 'Model wordt geladen...' };
  };

  const status = getBrowserMLStatus();

  return (
    <header className="border-b border-border/30 glass-strong sticky top-0 z-40 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={handleLogoClick}
          title="Klik om naar Admin Dashboard te gaan"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-coral to-primary-purple flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-display font-bold gradient-text">EvAI</h1>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant={status.color} className="cursor-help gap-1 glass-strong border-border/20">
                {status.icon} {status.text}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs glass-strong border-border/20">
              <p className="font-semibold">Browser ML Status</p>
              <p className="text-sm">{status.description}</p>
            </TooltipContent>
          </Tooltip>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSettingsClick} 
            className="glass hover:glass-strong transition-all duration-300"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
