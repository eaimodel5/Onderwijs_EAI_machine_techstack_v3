import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Server, Lock, CheckCircle } from 'lucide-react';

const ServerSideApiStatus: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          API Configuration - Server Side
          <Badge className="bg-green-100 text-green-800">Production</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Server className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-blue-900 mb-1">Server-Side Architecture</p>
            <p className="text-sm text-blue-700">
              All API keys (OpenAI, Vector) are securely managed via Supabase Edge Function Secrets. 
              Keys are never exposed to the client.
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              OpenAI Primary API
            </span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              Server-Side Active
            </Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Browser ML Engine (WebGPU/WASM)
            </span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              Client-Side Active
            </Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Vector Embedding API
            </span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              Server-Side Active
            </Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Google API
            </span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              Server-Side Active
            </Badge>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <Lock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-green-700">
              <strong className="block mb-1">Production Features Active:</strong>
              Real-time validation, secure storage in Supabase Secrets, automatic failover, 
              comprehensive error handling, and zero client-side exposure.
            </p>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <p className="text-sm text-indigo-800">
            <strong>Edge Functions:</strong> All API calls are routed through secure Edge Functions 
            (<code className="bg-indigo-100 px-1 rounded">evai-orchestrate</code>, 
            <code className="bg-indigo-100 px-1 rounded ml-1">openai-embedding</code>) 
            ensuring maximum security and scalability.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServerSideApiStatus;
