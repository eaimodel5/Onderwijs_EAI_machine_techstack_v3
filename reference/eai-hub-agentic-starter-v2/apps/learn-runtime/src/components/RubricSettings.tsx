import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useRubricSettings, RubricStrictnessLevel } from '../hooks/useRubricSettings';
import { Gauge, AlertTriangle, Shield, Loader2, CheckCircle } from 'lucide-react';

const RubricSettings: React.FC = () => {
  const { config, isLoading, updateStrictness } = useRubricSettings();
  const [strictness, setStrictness] = useState<RubricStrictnessLevel>(config.level);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setStrictness(config.level);
  }, [config.level]);

  const handleValueChange = async (value: string) => {
    const newLevel = value as RubricStrictnessLevel;
    console.log('🔧 User changed rubric level to:', newLevel);
    
    setStrictness(newLevel);
    setIsSaving(true);
    
    try {
      const success = await updateStrictness(newLevel);
      
      if (success) {
        console.log('✅ Rubric setting saved successfully');
        toast({ 
          title: "✅ Instelling opgeslagen", 
          description: `Rubric strengheid is nu: ${getLevelDisplayName(newLevel)}`,
          duration: 3000
        });
      } else {
        console.error('❌ Failed to save rubric setting');
        toast({ 
          title: "❌ Fout bij opslaan", 
          description: "De instelling kon niet worden opgeslagen. Probeer het opnieuw.",
          variant: "destructive",
          duration: 5000
        });
        // Reset to previous value on error
        setStrictness(config.level);
      }
    } catch (error) {
      console.error('❌ Error saving rubric setting:', error);
      toast({ 
        title: "❌ Onverwachte fout", 
        description: "Er is een onverwachte fout opgetreden. Probeer het opnieuw.",
        variant: "destructive",
        duration: 5000
      });
      // Reset to previous value on error
      setStrictness(config.level);
    } finally {
      setIsSaving(false);
    }
  };

  const getLevelDisplayName = (level: RubricStrictnessLevel): string => {
    switch (level) {
      case 'strict': return 'Streng';
      case 'moderate': return 'Gebalanceerd';
      case 'flexible': return 'Flexibel';
      default: return level;
    }
  };

  const getLevelIcon = (level: RubricStrictnessLevel) => {
    switch (level) {
      case 'strict': return <AlertTriangle className="w-4 h-4" />;
      case 'moderate': return <Gauge className="w-4 h-4" />;
      case 'flexible': return <Shield className="w-4 h-4" />;
    }
  };

  const getLevelDescription = (level: RubricStrictnessLevel): string => {
    switch (level) {
      case 'strict':
        return 'Zeer gevoelig voor risicosignalen, lagere drempelwaarden voor waarschuwingen';
      case 'moderate':
        return 'Gebalanceerde gevoeligheid voor risico- en beschermende factoren';
      case 'flexible':
        return 'Hogere drempelwaarden, minder gevoelig voor kleine risico\'s';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Instellingen laden...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="w-5 h-5" />
          Rubric Engine Strengheid
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {!isSaving && config.level === strictness && <CheckCircle className="w-4 h-4 text-green-600" />}
        </CardTitle>
        <CardDescription>
          Bepaal hoe strikt de engine moet zijn bij het matchen van triggers en het detecteren van risicofactoren.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={strictness} onValueChange={handleValueChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="strict" className="flex items-center gap-2" disabled={isSaving}>
              {getLevelIcon('strict')}
              <span className="hidden sm:inline">Streng</span>
              <span className="sm:hidden">S</span>
            </TabsTrigger>
            <TabsTrigger value="moderate" className="flex items-center gap-2" disabled={isSaving}>
              {getLevelIcon('moderate')}
              <span className="hidden sm:inline">Gebalanceerd</span>
              <span className="sm:hidden">G</span>
            </TabsTrigger>
            <TabsTrigger value="flexible" className="flex items-center gap-2" disabled={isSaving}>
              {getLevelIcon('flexible')}
              <span className="hidden sm:inline">Flexibel</span>
              <span className="sm:hidden">F</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            {getLevelIcon(strictness)}
            <span className="font-medium">{getLevelDisplayName(strictness)}</span>
            {isSaving && <span className="text-sm text-muted-foreground">(Opslaan...)</span>}
          </div>
          <p className="text-sm text-muted-foreground">
            {getLevelDescription(strictness)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Risico drempel:</span> {config.thresholds.riskAlert}
          </div>
          <div>
            <span className="font-medium">Hoog risico:</span> {config.thresholds.overallRiskHigh}%
          </div>
          <div>
            <span className="font-medium">Matig risico:</span> {config.thresholds.overallRiskModerate}%
          </div>
          <div>
            <span className="font-medium">Min. beschermende factoren:</span> {config.thresholds.protectiveFactorsMin}
          </div>
        </div>

        {isSaving && (
          <div className="text-center text-sm text-muted-foreground">
            Instellingen worden opgeslagen...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RubricSettings;
