
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { HealthCheckResult as HealthCheckResultType } from '../../../types/healthCheck';

interface HealthCheckResultProps {
  result: HealthCheckResultType;
}

const HealthCheckResult: React.FC<HealthCheckResultProps> = ({ result }) => {
  const getStatusIcon = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: 'success' | 'warning' | 'error') => {
    const variants = {
      success: 'default' as const,
      warning: 'secondary' as const,
      error: 'destructive' as const
    };
    
    const labels = {
      success: 'OK',
      warning: 'Waarschuwing',
      error: 'Fout'
    };
    
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        {getStatusIcon(result.status)}
        <div>
          <p className="font-medium">{result.component}</p>
          <p className="text-sm text-gray-600">{result.message}</p>
          {result.details && (
            <p className="text-xs text-gray-500 mt-1">{result.details}</p>
          )}
        </div>
      </div>
      {getStatusBadge(result.status)}
    </div>
  );
};

export default HealthCheckResult;
