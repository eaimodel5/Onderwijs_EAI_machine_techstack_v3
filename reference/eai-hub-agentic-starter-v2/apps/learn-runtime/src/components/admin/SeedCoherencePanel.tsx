/**
 * Seed Coherence Panel
 * Admin tool to scan and fix overspecific seeds
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, XCircle, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { scanForOverspecificSeeds, getOverspecificSeedsList, deactivateSeed, CleanupReport } from '@/utils/seedDatabaseCleanup';

export function SeedCoherencePanel() {
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<CleanupReport | null>(null);
  const [overspecificSeeds, setOverspecificSeeds] = useState<any[]>([]);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      toast.info('Scanning database for overspecific seeds...');
      const scanReport = await scanForOverspecificSeeds();
      setReport(scanReport);
      
      if (scanReport.overspecificFound > 0) {
        toast.success(`Found ${scanReport.overspecificFound} overspecific seeds. Fixed: ${scanReport.fixed}, Deactivated: ${scanReport.deactivated}`);
      } else {
        toast.success('No overspecific seeds found! Database is clean.');
      }

      if (scanReport.errors.length > 0) {
        toast.error(`Errors: ${scanReport.errors.join(', ')}`);
      }

      // Refresh list
      const list = await getOverspecificSeedsList();
      setOverspecificSeeds(list);

    } catch (error) {
      toast.error(`Scan failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleGetList = async () => {
    try {
      toast.info('Fetching overspecific seeds...');
      const list = await getOverspecificSeedsList();
      setOverspecificSeeds(list);
      
      if (list.length === 0) {
        toast.success('No overspecific seeds found!');
      } else {
        toast.info(`Found ${list.length} overspecific seeds for review`);
      }
    } catch (error) {
      toast.error(`Failed to fetch list: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDeactivate = async (seedId: string) => {
    try {
      const result = await deactivateSeed(seedId);
      if (result.success) {
        toast.success(`Seed ${seedId} deactivated`);
        // Refresh list
        const list = await getOverspecificSeedsList();
        setOverspecificSeeds(list);
      } else {
        toast.error(result.error || 'Failed to deactivate seed');
      }
    } catch (error) {
      toast.error(`Deactivation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Seed Coherence Scanner</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Scans database for seeds with overspecific context (e.g., "na een goede nachtrust") 
              and automatically fixes or deactivates them.
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleScan} 
              disabled={isScanning}
              className="gap-2"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Scan & Auto-Fix
                </>
              )}
            </Button>

            <Button 
              onClick={handleGetList} 
              variant="outline"
              className="gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              View Problematic Seeds
            </Button>
          </div>

          {report && (
            <div className="mt-6 p-4 bg-muted rounded-lg space-y-3">
              <h4 className="font-medium">Scan Report</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Scanned</p>
                  <p className="text-2xl font-bold">{report.totalScanned}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Overspecific Found</p>
                  <p className="text-2xl font-bold text-yellow-600">{report.overspecificFound}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Fixed</p>
                  <p className="text-2xl font-bold text-green-600">{report.fixed}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Deactivated</p>
                  <p className="text-2xl font-bold text-orange-600">{report.deactivated}</p>
                </div>
              </div>

              {report.errors.length > 0 && (
                <div className="mt-3 p-3 bg-destructive/10 rounded border border-destructive/20">
                  <p className="text-sm font-medium text-destructive mb-2">Errors:</p>
                  <ul className="text-xs text-destructive space-y-1">
                    {report.errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {overspecificSeeds.length > 0 && (
        <Card className="p-6">
          <h4 className="font-medium mb-4">Overspecific Seeds for Review</h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {overspecificSeeds.map((seed) => (
              <div 
                key={seed.id} 
                className="p-3 border rounded-lg space-y-2 bg-card"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {seed.emotion}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ID: {seed.id.substring(0, 8)}...
                      </span>
                    </div>
                    
                    <p className="text-sm mb-2 line-clamp-2">
                      {seed.response_text}
                    </p>
                    
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Triggers:</span> {seed.triggers?.join(', ') || 'None'}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeactivate(seed.id)}
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-muted/50">
        <h4 className="font-medium mb-3">How It Works</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
            <span>Scans all active seeds for overspecific temporal references</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
            <span>Automatically replaces overspecific patterns with template parameters</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
            <span>Deactivates seeds that can't be fixed automatically</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-600 shrink-0" />
            <span>New seeds are validated at generation time to prevent overspecific content</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}