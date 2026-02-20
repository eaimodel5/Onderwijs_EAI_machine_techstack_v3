
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash } from 'lucide-react';
import { AdvancedSeed } from '../../types/seed';

interface AdvancedSeedTableProps {
  seeds: AdvancedSeed[];
  onEdit: (seed: AdvancedSeed) => void;
  onDelete: (seed: AdvancedSeed) => void;
}

const AdvancedSeedTable: React.FC<AdvancedSeedTableProps> = ({ seeds, onEdit, onDelete }) => {
  const getLabelColor = (label: string) => {
    switch (label) {
      case 'Valideren': return 'bg-green-100 text-green-800';
      case 'Reflectievraag': return 'bg-blue-100 text-blue-800';
      case 'Suggestie': return 'bg-purple-100 text-purple-800';
      case 'Interventie': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Emotie</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Triggers</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>TTL</TableHead>
            <TableHead>Gebruik</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Acties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {seeds.map((seed) => (
            <TableRow key={seed.id}>
              <TableCell className="font-medium">{seed.emotion}</TableCell>
              <TableCell>
                <Badge className={getLabelColor(seed.label)}>
                  {seed.label}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getSeverityColor(seed.context.severity)}>
                  {seed.context.severity}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {seed.triggers.slice(0, 2).map((trigger, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {trigger}
                    </Badge>
                  ))}
                  {seed.triggers.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{seed.triggers.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{seed.meta.weight.toFixed(1)}</TableCell>
              <TableCell>{seed.meta.ttl ?? '-'}</TableCell>
              <TableCell>{seed.meta.usageCount}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {seed.tags.slice(0, 2).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={seed.isActive ? "default" : "secondary"}>
                  {seed.isActive ? "Actief" : "Inactief"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(seed)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(seed)}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdvancedSeedTable;
