
export interface ConnectionStatus {
  supabase: 'connected' | 'error' | 'checking';
  openaiApi1: 'configured' | 'missing' | 'checking';
  browserML: 'configured' | 'missing' | 'checking';
  vectorApi: 'configured' | 'missing' | 'checking';
  seeds: 'loaded' | 'error' | 'loading';
}
