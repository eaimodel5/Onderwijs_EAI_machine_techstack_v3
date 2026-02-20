import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ContextualHelpProps {
  term: 'eaa' | 'td-matrix' | 'eai-rules' | 'rubrics' | 'self-learning';
  className?: string;
}

const HELP_CONTENT = {
  'eaa': {
    title: 'EAA Framework',
    content: 'Emotionele eigenaarschap, Autonomie & Agency - meet de zelfsturing van de gebruiker in het gesprek.'
  },
  'td-matrix': {
    title: 'TD-Matrix',
    content: 'Technological Dependency Matrix - evalueert de balans tussen AI-ondersteuning en gebruikersautonomie.'
  },
  'eai-rules': {
    title: 'E_AI Rules',
    content: 'Ethische AI-regels die bepalen wanneer de AI moet interveniëren of juist ruimte moet geven.'
  },
  'rubrics': {
    title: 'EvAI Rubrics',
    content: 'Analyseert gesprekskwaliteit op basis van risico- en beschermende factoren voor emotionele veiligheid.'
  },
  'self-learning': {
    title: 'Self-Learning',
    content: 'Het systeem leert automatisch uit gesprekken en genereert nieuwe emotionele seeds bij unieke situaties.'
  }
};

export const ContextualHelp: React.FC<ContextualHelpProps> = ({ term, className = '' }) => {
  const help = HELP_CONTENT[term];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className={`inline-flex items-center justify-center ${className}`}>
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-semibold text-sm mb-1">{help.title}</p>
          <p className="text-xs text-muted-foreground">{help.content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
