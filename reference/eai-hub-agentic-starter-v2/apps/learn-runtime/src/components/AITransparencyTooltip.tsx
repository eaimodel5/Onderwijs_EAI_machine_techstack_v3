import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface AITransparencyTooltipProps {
  label: "Valideren" | "Reflectievraag" | "Suggestie" | "Fout";
  reasoning?: string;
  techniques?: string[];
  reliability?: number;
  gapAnalysis?: string;
}

const AITransparencyTooltip: React.FC<AITransparencyTooltipProps> = ({
  label,
  reasoning,
  techniques = [],
  reliability = 0.85,
  gapAnalysis
}) => {
  const getDefaultReasoning = (label: string) => {
    switch (label) {
      case "Valideren":
        return "AI detecteerde bevestigende taal en emotionele ondersteuning in je bericht.";
      case "Reflectievraag":
        return "AI identificeerde een kans voor diepere zelfreflectie gebaseerd op je uitingen.";
      case "Suggestie":
        return "AI vond patronen die duiden op behoefte aan praktische oplossingen.";
      case "Fout":
        return "AI detecteerde mogelijk problematische inhoud of technische fouten.";
      default:
        return "AI analyseerde je bericht met natuurlijke taalverwerking.";
    }
  };

  const getDefaultTechniques = (label: string) => {
    switch (label) {
      case "Valideren":
        return ["Sentimentanalyse", "Emotieherkenning", "EvAI-56 Rubrieken"];
      case "Reflectievraag":
        return ["Patroonherkenning", "Metacognitieve analyse", "Zelfbewustzijn-rubrieken"];
      case "Suggestie":
        return ["Probleemdetectie", "Oplossingsgeneratie", "Gedragsanalyse"];
      case "Fout":
        return ["Inhoudsfiltering", "Veiligheidscontrole", "Contextanalyse"];
      default:
        return ["Natuurlijke taalverwerking"];
    }
  };

  const finalReasoning = reasoning || getDefaultReasoning(label);
  const finalTechniques = techniques.length > 0 ? techniques : getDefaultTechniques(label);
  const reliabilityPercentage = Math.round(reliability * 100);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="ml-1 p-0.5 rounded-full hover:bg-accent transition-colors">
          <Info size={12} className="text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4 glass-strong border-primary-purple/20 shadow-elegant z-50 animate-fade-slide-in" 
        side="top" 
        align="start"
        sideOffset={8}
      >
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-1">Waarom dit label?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{finalReasoning}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-2">AI Technieken gebruikt:</h4>
            <div className="flex flex-wrap gap-1">
              {finalTechniques.map((technique, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {technique}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-1">Betrouwbaarheid</h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary-coral to-primary-purple h-2 rounded-full transition-all duration-500 shadow-glow-sm"
                  style={{ width: `${reliabilityPercentage}%` }}
                />
              </div>
              <span className="text-xs font-medium gradient-text">{reliabilityPercentage}%</span>
            </div>
          </div>

          {gapAnalysis && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Analyse Details</h4>
              <p className="text-xs text-muted-foreground leading-relaxed bg-muted/50 p-2 rounded">
                {gapAnalysis}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AITransparencyTooltip;
