import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SeedRow {
  id: string;
  emotion: string;
  label: string | null;
  created_at: string | null;
}

const SeedLearningLog: React.FC = () => {
  const [rows, setRows] = useState<SeedRow[]>([]);

  const fetchRows = async () => {
    const { data, error } = await supabase
      .from('emotion_seeds')
      .select('id, emotion, label, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setRows(data);
    }
  };

  useEffect(() => {
    fetchRows();

    const channel = supabase
      .channel('seed-learning-log')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emotion_seeds' },
        () => {
          fetchRows();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle>Seed Learning Log</CardTitle>
        <CardDescription>Laatste 10 toegevoegde seeds</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Emotion</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Aangemaakt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row.id}>
                <TableCell>{row.emotion}</TableCell>
                <TableCell>{row.label ?? '-'}</TableCell>
                <TableCell>
                  {row.created_at ? new Date(row.created_at).toLocaleString('nl-NL') : ''}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-sm text-gray-500">
                  Geen data beschikbaar
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SeedLearningLog;
