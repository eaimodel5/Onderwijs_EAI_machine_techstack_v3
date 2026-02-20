
import React from 'react';
import HealthCheckResult from './HealthCheckResult';
import { HealthCheckResult as HealthCheckResultType } from '../../../types/healthCheck';

interface HealthCheckResultsProps {
  results: HealthCheckResultType[];
}

const HealthCheckResults: React.FC<HealthCheckResultsProps> = ({ results }) => {
  if (results.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Test Resultaten:</h3>
      {results.map((result, index) => (
        <HealthCheckResult key={index} result={result} />
      ))}
    </div>
  );
};

export default HealthCheckResults;
