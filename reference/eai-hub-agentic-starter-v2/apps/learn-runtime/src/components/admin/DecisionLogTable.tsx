import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

interface DecisionLog {
  id: string;
  userInput: string;
  finalResponse: string;
  outcome: 'OK' | 'BLOCKED';
  processingPath?: string;
  processingTime?: number;
  validated?: boolean;
  constraintsOK?: boolean;
  createdAt: string;
  auditLog?: string[];
  fusionMetadata?: {
    strategy?: 'neural_enhanced' | 'weighted_blend' | 'symbolic_fallback';
    symbolicWeight?: number;
    neuralWeight?: number;
    preservationScore?: number;
  };
  eaaProfile?: { ownership: number; autonomy: number; agency: number };
  tdMatrix?: { value: number; flag: string; shouldBlock: boolean };
  eaiRules?: { ruleId?: string; reason?: string };
  safetyCheck?: { decision: string; score: number };
  rubricsAnalysis?: { overallRisk: number; overallProtective: number };
}

interface DecisionLogTableProps {
  logs: DecisionLog[];
  isLoading?: boolean;
}

export const DecisionLogTable: React.FC<DecisionLogTableProps> = ({ logs, isLoading }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Loading decision logs...
        </CardContent>
      </Card>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No decision logs available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Decisions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Input</TableHead>
              <TableHead>Path</TableHead>
              <TableHead>Fusion</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const isExpanded = expandedRows.has(log.id);
              return (
                <React.Fragment key={log.id}>
                  <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(log.id)}>
                    <TableCell>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{log.userInput}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.processingPath || 'unknown'}</Badge>
                    </TableCell>
                    <TableCell>
                      {log.fusionMetadata ? (
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {log.fusionMetadata.strategy === 'neural_enhanced' ? '🧬 Neural+' : 
                             log.fusionMetadata.strategy === 'weighted_blend' ? '⚖️ Blend' : 
                             '🧠 Symbolic'}
                          </Badge>
                          {log.fusionMetadata.symbolicWeight && (
                            <span className="text-xs text-muted-foreground">
                              {Math.round(log.fusionMetadata.symbolicWeight * 100)}/{Math.round((log.fusionMetadata.neuralWeight || 0) * 100)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">N/A</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.outcome === 'OK' ? 'default' : 'destructive'}>
                        {log.outcome}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.processingTime ? `${log.processingTime}ms` : '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(log.createdAt), 'HH:mm:ss')}
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/30 p-4">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold mb-2">Response:</p>
                            <p className="text-sm text-muted-foreground">{log.finalResponse}</p>
                          </div>
                          {log.auditLog && log.auditLog.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold mb-2">Audit Log:</p>
                              <div className="bg-slate-900 text-green-400 p-3 rounded font-mono text-xs overflow-auto max-h-64">
                                {log.auditLog.map((entry, idx) => (
                                  <div key={idx}>{entry}</div>
                                ))}
                              </div>
                            </div>
                          )}
                           <div className="flex gap-4 text-xs flex-wrap">
                            <span>
                              Validated: <Badge variant={log.validated ? 'default' : 'destructive'}>{log.validated ? 'Yes' : 'No'}</Badge>
                            </span>
                            <span>
                              Constraints: <Badge variant={log.constraintsOK ? 'default' : 'destructive'}>{log.constraintsOK ? 'OK' : 'Violated'}</Badge>
                            </span>
                            {log.eaaProfile && (
                              <span>
                                EAA: <Badge variant="outline">O:{log.eaaProfile.ownership.toFixed(2)} A:{log.eaaProfile.autonomy.toFixed(2)} Ag:{log.eaaProfile.agency.toFixed(2)}</Badge>
                              </span>
                            )}
                            {log.tdMatrix && (
                              <span>
                                TD: <Badge variant={log.tdMatrix.shouldBlock ? 'destructive' : 'default'}>{log.tdMatrix.value.toFixed(2)} {log.tdMatrix.flag}</Badge>
                              </span>
                            )}
                            {log.safetyCheck && (
                              <span>
                                Safety: <Badge variant={log.safetyCheck.decision === 'allow' ? 'default' : 'destructive'}>{log.safetyCheck.decision}</Badge>
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
