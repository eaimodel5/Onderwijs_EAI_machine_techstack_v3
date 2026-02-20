
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface HealthCheckProgressProps {
  isRunning: boolean;
  progress: number;
}

const HealthCheckProgress: React.FC<HealthCheckProgressProps> = ({ isRunning, progress }) => {
  if (!isRunning) return null;

  return (
    <div className="flex-1">
      <Progress value={progress} className="w-full" />
      <p className="text-sm text-gray-600 mt-1">{Math.round(progress)}% voltooid</p>
    </div>
  );
};

export default HealthCheckProgress;
