
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Zap, Brain } from 'lucide-react';
import { getStatusColor as getStatusColorGeneric } from '@/utils/statusUtils';

interface SystemInteractionMatrixProps {
  messageCount: number;
}

const SystemInteractionMatrix: React.FC<SystemInteractionMatrixProps> = ({ messageCount }) => {
  const systems = [
    {
      name: 'Neural Engine',
      icon: <Brain size={14} />,
      status: 'online',
      health: 98,
      description: 'AI Respons Generatie'
    },
    {
      name: 'Rubrics Engine',
      icon: <Activity size={14} />,
      status: 'online',
      health: 95,
      description: 'Patroon Analyse'
    },
    {
      name: 'Vector Store',
      icon: <Database size={14} />,
      status: 'online',
      health: 92,
      description: 'Embeddings Database'
    },
    {
      name: 'Real-time Sync',
      icon: <Zap size={14} />,
      status: 'online',
      health: 97,
      description: 'Live Updates'
    }
  ];

  const mapToHealth = (status: string): 'healthy' | 'warning' | 'error' => {
    switch (status) {
      case 'online': return 'healthy';
      case 'warning': return 'warning';
      case 'offline': return 'error';
      default: return 'warning';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'bg-green-500';
    if (health >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-800 flex items-center gap-2">
          <Activity size={16} />
          Systeem Status Matrix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-gray-600 mb-3">
          Berichten verwerkt: <span className="font-medium text-blue-600">{messageCount}</span>
        </div>
        
        {systems.map((system, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-gray-600">
                  {system.icon}
                </div>
                <span className="text-sm font-medium text-gray-800">{system.name}</span>
              </div>
              <Badge variant="outline" className={`text-xs border ${getStatusColorGeneric(mapToHealth(system.status))}`}>
                {system.status}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{system.description}</span>
                <span className="font-medium text-gray-800">{system.health}%</span>
              </div>
              <Progress 
                value={system.health} 
                className="h-1.5"
                style={{ 
                  '--progress-background': getHealthColor(system.health) 
                } as React.CSSProperties}
              />
            </div>
          </div>
        ))}
        
        <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
          <div className="text-xs text-blue-700 text-center">
            Alle systemen operationeel - Real-time monitoring actief
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemInteractionMatrix;
