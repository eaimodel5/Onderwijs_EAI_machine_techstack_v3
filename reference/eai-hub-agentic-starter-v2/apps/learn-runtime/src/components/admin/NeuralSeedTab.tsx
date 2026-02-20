
import React, { useState } from 'react';
import { incrementApiUsage } from '@/utils/apiUsageTracker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AdvancedSeed } from '../../types/seed';
import { v4 as uuidv4 } from 'uuid';
import { OPENAI_MODEL } from '../../openaiConfig';

interface NeuralSeedTabProps {
  seeds: AdvancedSeed[];
  onSeedGenerated: () => void;
}

const NeuralSeedTab: React.FC<NeuralSeedTabProps> = ({ seeds, onSeedGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState('');

  const generateSeedWithAI = async (emotion: string, triggers: string[]) => {
    // All AI seed generation now happens server-side via Edge Functions
    toast({
      title: "Feature tijdelijk uitgeschakeld",
      description: "Neural seed generatie is verplaatst naar server-side. Gebruik de Enhanced Seed Generator in plaats daarvan.",
      variant: "default"
    });
  };

  const analyzeConversationPattern = async () => {
    // All AI analysis now happens server-side via Edge Functions
    toast({
      title: "Feature tijdelijk uitgeschakeld",
      description: "Patroon analyse is verplaatst naar server-side.",
      variant: "default"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧠 Neurosymbolische AI Engine</CardTitle>
        <CardDescription>
          Zelf-lerende conversatie analyse en seed generatie
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">AI Seed Generatie</h4>
            <p className="text-sm text-gray-600 mb-4">
              Laat OpenAI (key 2) nieuwe therapeutische seeds genereren
            </p>
            <div className="flex gap-2">
              <Input placeholder="Emotie (bijv. angst)" className="flex-1" id="new-emotion" />
              <Button 
                onClick={() => {
                  const emotion = (document.getElementById('new-emotion') as HTMLInputElement)?.value;
                  if (emotion) generateSeedWithAI(emotion, [emotion]);
                }}
                disabled={isGenerating}
              >
                {isGenerating ? 'Bezig...' : 'Genereer'}
              </Button>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium mb-2">Patroon Analyse</h4>
            <p className="text-sm text-gray-600 mb-4">
              Analyseer conversatiepatronen en ontbrekende emoties
            </p>
          <Button
              onClick={analyzeConversationPattern}
              className="w-full"
              disabled={isAnalyzing}
            >
              <BarChart size={16} className="mr-2" />
              {isAnalyzing ? 'Bezig...' : 'Analyseer Patronen'}
            </Button>
            {analysisResults && (
              <pre className="mt-2 p-2 bg-white text-xs rounded border">
                {analysisResults}
              </pre>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NeuralSeedTab;
