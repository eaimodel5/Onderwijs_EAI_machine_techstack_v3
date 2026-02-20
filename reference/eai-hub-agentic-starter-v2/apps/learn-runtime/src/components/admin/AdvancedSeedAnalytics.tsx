
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdvancedSeed } from '../../types/seed';

interface AdvancedSeedAnalyticsProps {
  seeds: AdvancedSeed[];
}

const AdvancedSeedAnalytics: React.FC<AdvancedSeedAnalyticsProps> = ({ seeds }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Totaal Seeds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{seeds.length}</div>
          <div className="text-xs text-gray-500">
            {seeds.filter(s => s.isActive).length} actief
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Meest Gebruikt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.max(...seeds.map(s => s.meta.usageCount), 0)}
          </div>
          <div className="text-xs text-gray-500">keer gebruikt</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">AI Gegenereerd</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {seeds.filter(s => s.createdBy === 'ai').length}
          </div>
          <div className="text-xs text-gray-500">van totaal</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedSeedAnalytics;
