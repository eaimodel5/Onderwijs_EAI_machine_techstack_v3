
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Shield, AlertTriangle, Target, Zap } from 'lucide-react';

const RubricsSystemDescription: React.FC = () => {
  const features = [
    {
      icon: <Brain size={16} />,
      title: 'Emotionele Analyse',
      description: 'Detecteert emotionele patronen in gesprekken',
      status: 'Actief'
    },
    {
      icon: <Shield size={16} />,
      title: 'Beschermende Factoren',
      description: 'Identificeert positieve copingstrategieën',
      status: 'Actief'
    },
    {
      icon: <AlertTriangle size={16} />,
      title: 'Risico Assessment',
      description: 'Monitort risicofactoren en triggers',
      status: 'Actief'
    },
    {
      icon: <Target size={16} />,
      title: 'Interventie Suggesties',
      description: 'Biedt gerichte ondersteuning aan',
      status: 'Actief'
    }
  ];

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Zap size={20} />
          <span>EvAI 5.6 Rubrics Engine</span>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
            Pro
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-blue-700 leading-relaxed">
          Het EvAI 5.6 systeem analyseert gesprekken in real-time om emotionele patronen, 
          risicofactoren en beschermende elementen te identificeren. Dit helpt bij het 
          bieden van gepersonaliseerde ondersteuning en inzichten.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/60 rounded-lg p-3 border border-blue-100">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 mt-0.5">
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-blue-900">{feature.title}</h4>
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      {feature.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-blue-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Brain size={14} />
            <span className="font-medium">Status:</span>
            <span>Volledig operationeel - Realtime analyse actief</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RubricsSystemDescription;
