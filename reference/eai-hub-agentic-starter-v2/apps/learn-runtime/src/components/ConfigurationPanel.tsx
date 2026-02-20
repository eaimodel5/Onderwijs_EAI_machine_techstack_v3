
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ConfigurationSettings {
  enableSymbolicEngine: boolean;
  enableNeuralProcessing: boolean;
  enableVectorSearch: boolean;
  confidenceThreshold: number;
  processingTimeout: number;
  maxHistoryLength: number;
  debugMode: boolean;
}

const ConfigurationPanel: React.FC = () => {
  const [settings, setSettings] = useState<ConfigurationSettings>({
    enableSymbolicEngine: true,
    enableNeuralProcessing: true,
    enableVectorSearch: true,
    confidenceThreshold: 0.7,
    processingTimeout: 10000,
    maxHistoryLength: 20,
    debugMode: false
  });


  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('evai-configuration');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }

  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Save configuration settings
      localStorage.setItem('evai-configuration', JSON.stringify(settings));
      
      toast({
        title: "Instellingen opgeslagen",
        description: "Je configuratie is succesvol opgeslagen.",
      });
    } catch (error) {
      toast({
        title: "Fout bij opslaan",
        description: "Er ging iets mis bij het opslaan van de instellingen.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    setSettings({
      enableSymbolicEngine: true,
      enableNeuralProcessing: true,
      enableVectorSearch: true,
      confidenceThreshold: 0.7,
      processingTimeout: 10000,
      maxHistoryLength: 20,
      debugMode: false
    });
    
    toast({
      title: "Instellingen gereset",
      description: "Alle instellingen zijn teruggezet naar standaardwaarden.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Systeem Configuratie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Processing Components */}
          <div>
            <h3 className="text-sm font-medium mb-4">Verwerkingscomponenten</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="symbolic-engine">Symbolische Engine</Label>
                  <p className="text-xs text-muted-foreground">
                    Patroonherkenning en regelgebaseerde logica
                  </p>
                </div>
                <Switch
                  id="symbolic-engine"
                  checked={settings.enableSymbolicEngine}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, enableSymbolicEngine: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="neural-processing">Neurale Verwerking</Label>
                  <p className="text-xs text-muted-foreground">
                    AI-gebaseerde emotiedetectie en responsegeneratie
                  </p>
                </div>
                <Switch
                  id="neural-processing"
                  checked={settings.enableNeuralProcessing}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, enableNeuralProcessing: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vector-search">Vector Zoekfunctie</Label>
                  <p className="text-xs text-muted-foreground">
                    Semantische zoekfunctie voor geavanceerde matching
                  </p>
                </div>
                <Switch
                  id="vector-search"
                  checked={settings.enableVectorSearch}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, enableVectorSearch: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Performance Settings */}
          <div>
            <h3 className="text-sm font-medium mb-4">Prestatie-instellingen</h3>
            <div className="space-y-4">
              <div>
                <Label>Vertrouwensdrempel: {settings.confidenceThreshold}</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Minimaal vertrouwen voor automatische antwoorden
                </p>
                <Slider
                  value={[settings.confidenceThreshold]}
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, confidenceThreshold: value[0] }))
                  }
                  max={1}
                  min={0.1}
                  step={0.05}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0.1 (Laag)</span>
                  <span>1.0 (Hoog)</span>
                </div>
              </div>

              <div>
                <Label>Verwerkingstimeout: {settings.processingTimeout / 1000}s</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Maximum tijd voor verwerking van een verzoek
                </p>
                <Slider
                  value={[settings.processingTimeout]}
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, processingTimeout: value[0] }))
                  }
                  max={30000}
                  min={5000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5s</span>
                  <span>30s</span>
                </div>
              </div>

              <div>
                <Label>Max Geschiedenis Lengte: {settings.maxHistoryLength}</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Aantal berichten om bij te houden voor context
                </p>
                <Slider
                  value={[settings.maxHistoryLength]}
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, maxHistoryLength: value[0] }))
                  }
                  max={50}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5</span>
                  <span>50</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Debug Settings */}
          <div>
            <h3 className="text-sm font-medium mb-4">Debug Instellingen</h3>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="debug-mode">Debug Modus</Label>
                <p className="text-xs text-muted-foreground">
                  Uitgebreide logging en ontwikkelaarsinformatie
                </p>
              </div>
              <Switch
                id="debug-mode"
                checked={settings.debugMode}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, debugMode: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Opslaan...' : 'Instellingen Opslaan'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleResetSettings}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset naar Standaard
        </Button>
      </div>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Systeemstatus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-muted-foreground">Symbolisch:</span>
              <Badge variant={settings.enableSymbolicEngine ? "default" : "secondary"}>
                {settings.enableSymbolicEngine ? "Actief" : "Uitgeschakeld"}
              </Badge>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Neuraal:</span>
              <Badge variant={settings.enableNeuralProcessing ? "default" : "secondary"}>
                {settings.enableNeuralProcessing ? "Actief" : "Uitgeschakeld"}
              </Badge>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Vector:</span>
              <Badge variant={settings.enableVectorSearch ? "default" : "secondary"}>
                {settings.enableVectorSearch ? "Actief" : "Uitgeschakeld"}
              </Badge>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Debug:</span>
              <Badge variant={settings.debugMode ? "destructive" : "outline"}>
                {settings.debugMode ? "Aan" : "Uit"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationPanel;
