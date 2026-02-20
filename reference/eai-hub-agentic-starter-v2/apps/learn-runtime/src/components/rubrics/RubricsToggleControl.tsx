
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BarChart, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RubricsEngineStatusIndicator from './RubricsEngineStatusIndicator';
import { Message } from '../../types';

interface RubricsToggleControlProps {
  isActive: boolean;
  onToggle: () => void;
  messages: Message[];
  disabled?: boolean;
  mode?: 'compact' | 'full';
  onModeChange?: (mode: 'compact' | 'full') => void;
}

const RubricsToggleControl: React.FC<RubricsToggleControlProps> = ({
  isActive,
  onToggle,
  messages,
  disabled = false,
  mode = 'compact',
  onModeChange
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        <BarChart 
          size={18} 
          className={`transition-colors ${isActive ? 'text-green-600' : 'text-gray-400'}`} 
        />
        <div className="flex items-center gap-2">
          <Label 
            htmlFor="analytics-switch" 
            className={`text-sm font-medium cursor-pointer transition-colors ${
              isActive ? 'text-green-800' : 'text-gray-600'
            }`}
          >
            EvAI 5.6 Analyse
          </Label>
          <Switch
            id="analytics-switch"
            checked={isActive}
            onCheckedChange={onToggle}
            disabled={disabled}
            className="data-[state=checked]:bg-green-600"
          />
        </div>
      </div>
      
      {/* Mode toggle button - only show when analytics is active and we have mode control */}
      {isActive && onModeChange && messages.length > 3 && (
        <Button
          onClick={() => onModeChange(mode === 'compact' ? 'full' : 'compact')}
          variant="ghost"
          size="sm"
          className="p-2"
          title={mode === 'compact' ? 'Uitgebreid weergeven' : 'Compact weergeven'}
        >
          {mode === 'compact' ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
        </Button>
      )}
      
      <div className="hidden md:block">
        <RubricsEngineStatusIndicator messages={messages} isActive={isActive} />
      </div>
    </div>
  );
};

export default RubricsToggleControl;
