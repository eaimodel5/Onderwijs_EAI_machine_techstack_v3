
export interface HealthCheckResult {
  component: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}
