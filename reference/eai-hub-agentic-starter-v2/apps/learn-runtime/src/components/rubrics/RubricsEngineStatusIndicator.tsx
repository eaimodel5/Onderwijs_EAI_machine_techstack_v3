
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Message } from '../../types';

interface RubricsEngineStatusIndicatorProps {
  messages: Message[];
  isActive: boolean;
}

const RubricsEngineStatusIndicator: React.FC<RubricsEngineStatusIndicatorProps> = ({ 
  messages, 
  isActive 
}) => {
  const userMessages = messages.filter(msg => msg.from === 'user');
  const hasData = userMessages.length > 0;
  
  const getStatus = () => {
    if (!isActive) {
      return {
        icon: <XCircle size={14} />,
        label: 'Uit',
        color: 'bg-gray-100 text-gray-600 border-gray-200',
        description: 'Rubrics analyse is uitgeschakeld'
      };
    }
    
    if (!hasData) {
      return {
        icon: <AlertCircle size={14} />,
        label: 'Wachtend',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        description: 'Wacht op gesprekdata voor analyse'
      };
    }
    
    return {
      icon: <CheckCircle size={14} />,
      label: 'Actief',
      color: 'bg-green-100 text-green-700 border-green-200',
      description: 'Rubrics analyse is actief en functioneel'
    };
  };

  const status = getStatus();

  return (
    <div className="flex items-center gap-2">
      <Brain size={16} className="text-blue-600 flex-shrink-0" />
      <Badge variant="outline" className={`${status.color} text-xs flex items-center gap-1`}>
        {status.icon}
        <span>{status.label}</span>
      </Badge>
    </div>
  );
};

export default RubricsEngineStatusIndicator;
