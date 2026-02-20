import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Settings, Key, Network, Database, Shield, PlayCircle } from 'lucide-react';
import HealthCheckProgress from './healthCheck/HealthCheckProgress';
import HealthCheckResults from './healthCheck/HealthCheckResults';
import RubricSettings from '../RubricSettings';
import { useHealthCheck } from '../../hooks/useHealthCheck';
import { useSystemConnectivity } from '../../hooks/useSystemConnectivity';

const ConfigurationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('health');
  const { isRunning, progress, results, runHealthCheck } = useHealthCheck();
  const { status: connectivity, refresh: refreshConnectivity } = useSystemConnectivity();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configuration
          </CardTitle>
          <CardDescription>
            System health monitoring, API configuratie en rubric instellingen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="health" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Health Check
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                System Status
              </TabsTrigger>
              <TabsTrigger value="rubrics" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Rubrics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="health" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Network className="h-5 w-5" />
                      System Health Check
                    </span>
                    <Button
                      onClick={runHealthCheck}
                      disabled={isRunning}
                      className="flex items-center gap-2"
                    >
                      <PlayCircle className="h-4 w-4" />
                      {isRunning ? 'Running...' : 'Start Check'}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Comprehensive system health analysis en connectiviteit test
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <HealthCheckProgress isRunning={isRunning} progress={progress} />
                  <HealthCheckResults results={results} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    System Connectivity Status
                  </CardTitle>
                  <CardDescription>
                    Real-time status van alle systeem componenten
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg border">
                      <div className={`text-2xl mb-2 ${connectivity.supabase === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                        {connectivity.supabase === 'connected' ? '✅' : '❌'}
                      </div>
                      <div className="text-sm font-medium">Supabase</div>
                      <div className="text-xs text-gray-600 capitalize">{connectivity.supabase}</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border">
                      <div className={`text-2xl mb-2 ${connectivity.openaiApi1 === 'configured' ? 'text-green-600' : 'text-red-600'}`}>
                        {connectivity.openaiApi1 === 'configured' ? '✅' : '❌'}
                      </div>
                      <div className="text-sm font-medium">OpenAI API 1</div>
                      <div className="text-xs text-gray-600 capitalize">{connectivity.openaiApi1}</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border">
                      <div className={`text-2xl mb-2 ${connectivity.browserML === 'configured' ? 'text-green-600' : 'text-red-600'}`}>
                        {connectivity.browserML === 'configured' ? '✅' : '❌'}
                      </div>
                      <div className="text-sm font-medium">Browser ML (WebGPU/WASM)</div>
                      <div className="text-xs text-gray-600 capitalize">{connectivity.browserML}</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border">
                      <div className={`text-2xl mb-2 ${connectivity.vectorApi === 'configured' ? 'text-green-600' : 'text-red-600'}`}>
                        {connectivity.vectorApi === 'configured' ? '✅' : '❌'}
                      </div>
                      <div className="text-sm font-medium">Vector API</div>
                      <div className="text-xs text-gray-600 capitalize">{connectivity.vectorApi}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button onClick={refreshConnectivity} variant="outline" className="w-full">
                      Refresh Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rubrics" className="space-y-4">
              <RubricSettings />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationPanel;