
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, ArrowRight, Brain, Database, Zap, Shield, Eye } from 'lucide-react';

const NeurosymbolicArchitectureDiagram: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const steps = [
    {
      id: 'input',
      title: 'Gebruiker Input',
      icon: <Eye className="w-4 h-4" />,
      description: 'Emotionele boodschap van gebruiker',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      example: '"Ik voel me erg down..."'
    },
    {
      id: 'symbolic',
      title: 'Symbolische Engine',
      icon: <Shield className="w-4 h-4" />,
      description: 'Rubric pattern matching (offline)',
      color: 'bg-green-100 text-green-800 border-green-200',
      example: 'Emotionele Regulatie: 2.4 risico'
    },
    {
      id: 'neural',
      title: 'Neural Engine',
      icon: <Brain className="w-4 h-4" />,
      description: 'OpenAI API 1 - Taalverwerking',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      example: 'Sentiment: negatief, Context: depressie'
    },
    {
      id: 'vector',
      title: 'Vector Engine',
      icon: <Database className="w-4 h-4" />,
      description: 'Embedding similarity search',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      example: '85% match met "verdriet" seeds'
    },
    {
      id: 'synthesis',
      title: 'Hybrid Synthese',
      icon: <Zap className="w-4 h-4" />,
      description: 'Combineer alle inputs tot beslissing',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      example: 'Confidence: 92%, Seed: comfort-response'
    },
    {
      id: 'response',
      title: 'AI Response',
      icon: <Brain className="w-4 h-4" />,
      description: 'Gepersonaliseerde emotionele ondersteuning',
      color: 'bg-pink-100 text-pink-800 border-pink-200',
      example: '"Ik begrijp dat je je down voelt..."'
    },
    {
      id: 'learning',
      title: 'Leer-loop',
      icon: <Zap className="w-4 h-4" />,
      description: 'Feedback Analyse & Continue Verbetering',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      example: 'Feedback → nieuwe seeds → kennisbank'
    }
  ];

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            <span>Neurosymbolische Architectuur</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {isExpanded ? 'Inklappen' : 'Uitklappen'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
            <h4 className="font-medium text-indigo-800 mb-2">Volledige Neurosymbolische Flow</h4>
            <p className="text-sm text-indigo-700">
              Combinatie van symbolische regels (rubrics), neurale netwerken (OpenAI), en vector databases voor optimale emotionele intelligentie.
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                <div className={`p-3 rounded-lg border ${step.color}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{step.title}</span>
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          Stap {index + 1}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-700 mb-2">{step.description}</p>
                      <div className="text-xs italic text-gray-600 bg-white/50 px-2 py-1 rounded">
                        {step.example}
                      </div>
                    </div>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-800 text-sm">Symbolische Laag</div>
              <div className="text-xs text-green-600 mt-1">Pattern matching, rubrics, offline regels</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="font-medium text-purple-800 text-sm">Neurale Laag</div>
              <div className="text-xs text-purple-600 mt-1">OpenAI taalverwerking, contextbegrip</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="font-medium text-orange-800 text-sm">Vector Laag</div>
              <div className="text-xs text-orange-600 mt-1">Embedding search, semantische matching</div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default NeurosymbolicArchitectureDiagram;
