/**
 * EvAI Admin Dashboard - MasterFlow Visualization + HITL Bridge
 * Clean architecture with 4 core sections:
 * 1. MasterFlow - Live processing visualization
 * 2. Knowledge - Seeds, embeddings, coherence
 * 3. HITL - Queue, NGBSE, Auto-healing
 * 4. Settings - System configuration
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { DecisionLogTable } from '@/components/admin/DecisionLogTable';
import { SeedCoherencePanel } from '@/components/admin/SeedCoherencePanel';
import { TemplateParameterDocs } from '@/components/admin/TemplateParameterDocs';
import AdvancedSeedManager from '@/components/admin/AdvancedSeedManager';
import ConfigurationPanel from '@/components/admin/ConfigurationPanel';
import { EmbeddingHealthPanel } from '@/components/admin/EmbeddingHealthPanel';
import { BulkEmbeddingGenerator } from '@/components/admin/BulkEmbeddingGenerator';
import { supabase } from '../integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ANONYMOUS_SUPER_USER, useAuth } from '../hooks/useAuth';
import AdminAuth from '@/components/admin/AdminAuth';
import { HITLQueue } from '@/components/admin/HITLQueue';
import { NGBSEPanel } from '@/components/admin/NGBSEPanel';
import { HealingMetrics } from '@/components/admin/HealingMetrics';
import { LiveFlowDiagram } from '@/components/admin/LiveFlowDiagram';
import { MasterFlowStatus } from '@/components/admin/MasterFlowStatus';
import { FusionWeightMonitor } from '@/components/admin/FusionWeightMonitor';
import { LogOut, Trash2 } from 'lucide-react';
import { getAuditStats, getDecisionLogs } from '@/services/AuditService';

const AdminDashboard = () => {
  const { isAdminAuthorized, authorizeAdmin, logoutAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'masterflow' | 'knowledge' | 'hitl' | 'settings'>('masterflow');
  const [isConsolidating, setIsConsolidating] = useState(false);
  const { toast } = useToast();

  // Fetch audit statistics
  const { data: auditStats } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: async () => getAuditStats(ANONYMOUS_SUPER_USER.id, 200),
    refetchInterval: 15000,
  });

  // Fetch decision logs
  const { data: decisionLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['decision-logs'],
    queryFn: async () => getDecisionLogs(ANONYMOUS_SUPER_USER.id, 50),
    refetchInterval: 15000,
  });

  // Database cleanup
  const handleConsolidateKnowledge = async () => {
    setIsConsolidating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('evai-admin', {
        body: { operation: 'consolidate-knowledge' }
      });
      
      if (error) throw error;
      
      toast({
        title: '✅ Database Cleanup Successful',
        description: data?.cleanup 
          ? `Removed ${data.cleanup[0]} invalid seeds, ${data.cleanup[1]} invalid knowledge entries`
          : 'Knowledge base consolidated',
      });
      
    } catch (error) {
      console.error('Consolidation error:', error);
      toast({
        title: '❌ Cleanup Failed',
        description: error instanceof Error ? error.message : 'Failed to clean database',
        variant: 'destructive',
      });
    } finally {
      setIsConsolidating(false);
    }
  };

  // Auth guard
  if (!isAdminAuthorized) {
    return <AdminAuth onAuthenticated={authorizeAdmin} />;
  }

  // Calculate safety index
  const safetyIndex = auditStats 
    ? (100 - (auditStats.constraintsBlocked / Math.max(1, auditStats.totalDecisions)) * 100).toFixed(1)
    : '0';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar active={activeTab} onChange={setActiveTab} />

        <main className="flex-1 p-4 md:p-8 pt-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                EvAI Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                MasterFlow Visualization • HITL Bridge • Safety Index: {safetyIndex}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleConsolidateKnowledge}
                disabled={isConsolidating}
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isConsolidating ? 'Cleaning...' : 'Clean DB'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  logoutAdmin();
                  toast({ title: "Logged out", description: "Admin session ended" });
                }}
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="masterflow">🔄 MasterFlow</TabsTrigger>
              <TabsTrigger value="knowledge">🧠 Knowledge</TabsTrigger>
              <TabsTrigger value="hitl">🚨 HITL</TabsTrigger>
              <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
            </TabsList>

            {/* MASTERFLOW TAB */}
            <TabsContent value="masterflow" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LiveFlowDiagram />
                <MasterFlowStatus />
              </div>

              <FusionWeightMonitor />

              <Card>
                <CardHeader>
                  <CardTitle>📋 Decision Logs</CardTitle>
                  <CardDescription>
                    Real-time decision trail with audit details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DecisionLogTable logs={decisionLogs || []} isLoading={logsLoading} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* KNOWLEDGE TAB */}
            <TabsContent value="knowledge" className="space-y-6">
              <AdvancedSeedManager />
              
              <Card>
                <CardHeader>
                  <CardTitle>⚡ Embedding Health</CardTitle>
                  <CardDescription>
                    Vector embedding coverage voor neurosymbolic search
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmbeddingHealthPanel />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>🚀 Bulk Embedding Generator</CardTitle>
                  <CardDescription>
                    Generate embeddings for all seeds missing vector embeddings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BulkEmbeddingGenerator />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>📖 Template Parameters</CardTitle>
                  <CardDescription>
                    Beschikbare parameters voor dynamische seed responses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TemplateParameterDocs />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>🔧 Seed Coherence & Cleanup</CardTitle>
                  <CardDescription>
                    Database cleaning en template validation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SeedCoherencePanel />
                </CardContent>
              </Card>
            </TabsContent>

            {/* HITL TAB */}
            <TabsContent value="hitl" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>🚨 Human-In-The-Loop Queue</CardTitle>
                  <CardDescription>
                    Menselijke review voor kritieke situaties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HITLQueue />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>👁️ NGBSE - Blind Spot Detection</CardTitle>
                  <CardDescription>
                    AI blinde vlekken en aannames detector
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NGBSEPanel />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🔧 Auto-Healing Metrics</CardTitle>
                  <CardDescription>
                    Automatisch foutenherstel monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HealingMetrics />
                </CardContent>
              </Card>
            </TabsContent>

            {/* SETTINGS TAB */}
            <TabsContent value="settings" className="space-y-6">
              <ConfigurationPanel />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
