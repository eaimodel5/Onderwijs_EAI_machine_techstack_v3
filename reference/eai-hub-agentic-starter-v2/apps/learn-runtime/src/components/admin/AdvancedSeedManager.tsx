import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Database, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAdvancedSeedManager } from '../../hooks/useAdvancedSeedManager';
import AdvancedSeedEditor from './AdvancedSeedEditor';
import AdvancedSeedTable from './AdvancedSeedTable';
import AdvancedSeedAnalytics from './AdvancedSeedAnalytics';
import NeuralSeedTab from './NeuralSeedTab';
import UnifiedKnowledgeManager from './UnifiedKnowledgeManager';

const AdvancedSeedManager = () => {
  const {
    seedsData,
    editingSeed,
    setEditingSeed,
    isCreating,
    setIsCreating,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterSeverity,
    setFilterSeverity,
    filteredSeeds,
    handleSaveSeed,
    handleDeleteSeed,
    exportSeeds,
    loadSeedsData
  } = useAdvancedSeedManager();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="unified" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="unified">Unified Core</TabsTrigger>
          <TabsTrigger value="manage">Beheer</TabsTrigger>
          <TabsTrigger value="neural">Neurosymbolisch</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="unified" className="space-y-4">
          <UnifiedKnowledgeManager />
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database size={20} />
                Advanced Seed Beheer
              </CardTitle>
              <CardDescription>
                Beheer geavanceerde emotie seeds met contextuele matching en gewogen selectie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Zoek seeds..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="all">Alle types</option>
                      <option value="validation">Validatie</option>
                      <option value="reflection">Reflectie</option>
                      <option value="suggestion">Suggestie</option>
                      <option value="intervention">Interventie</option>
                    </select>
                    <select
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="all">Alle severity</option>
                      <option value="low">Laag</option>
                      <option value="medium">Gemiddeld</option>
                      <option value="high">Hoog</option>
                      <option value="critical">Kritiek</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={exportSeeds}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download size={16} />
                      Export
                    </Button>
                    <Button 
                      onClick={() => setIsCreating(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Nieuwe Seed
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  {filteredSeeds.length} van {seedsData.length} seeds ({seedsData.filter(s => s.isActive).length} actief)
                </div>
              </div>

              <AdvancedSeedTable
                seeds={filteredSeeds}
                onEdit={setEditingSeed}
                onDelete={handleDeleteSeed}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="neural" className="space-y-4">
          <NeuralSeedTab
            seeds={seedsData}
            onSeedGenerated={loadSeedsData}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AdvancedSeedAnalytics seeds={seedsData} />
        </TabsContent>

      </Tabs>

      {(editingSeed || isCreating) && (
        <AdvancedSeedEditor
          seed={editingSeed}
          onSave={handleSaveSeed}
          onCancel={() => {
            setEditingSeed(null);
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
};

export default AdvancedSeedManager;
