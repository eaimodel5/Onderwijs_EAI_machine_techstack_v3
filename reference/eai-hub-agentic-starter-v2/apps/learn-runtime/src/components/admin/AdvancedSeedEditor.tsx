
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { AdvancedSeed } from '../../types/seed';
import { v4 as uuidv4 } from 'uuid';

interface AdvancedSeedEditorProps {
  seed?: AdvancedSeed | null;
  onSave: (seed: AdvancedSeed) => void;
  onCancel: () => void;
}

const AdvancedSeedEditor: React.FC<AdvancedSeedEditorProps> = ({ seed, onSave, onCancel }) => {
  const [formData, setFormData] = useState<AdvancedSeed>({
    id: seed?.id || uuidv4(),
    emotion: seed?.emotion || '',
    type: seed?.type || 'validation',
    label: seed?.label || 'Valideren',
    triggers: seed?.triggers || [],
    response: seed?.response || { nl: '' },
    context: seed?.context || {
      severity: 'medium',
      situation: 'therapy'
    },
    meta: seed?.meta || {
      priority: 1,
      ttl: 30,
      weight: 1.0,
      confidence: 0.8,
      usageCount: 0
    },
    tags: seed?.tags || [],
    createdAt: seed?.createdAt || new Date(),
    updatedAt: new Date(),
    createdBy: seed?.createdBy || 'admin',
    isActive: seed?.isActive ?? true,
    version: seed?.version || '1.0.0'
  });

  const [triggerInput, setTriggerInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const handleAddTrigger = () => {
    if (triggerInput.trim() && !formData.triggers.includes(triggerInput.trim())) {
      setFormData(prev => ({
        ...prev,
        triggers: [...prev.triggers, triggerInput.trim()]
      }));
      setTriggerInput('');
    }
  };

  const handleRemoveTrigger = (trigger: string) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.filter(t => t !== trigger)
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.emotion && formData.response.nl && formData.triggers.length > 0) {
      onSave(formData);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{seed ? 'Advanced Seed Bewerken' : 'Nieuwe Advanced Seed'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Emotie *</label>
              <Input
                value={formData.emotion}
                onChange={(e) => setFormData(prev => ({ ...prev, emotion: e.target.value }))}
                placeholder="bijv. stress, verdriet, onzekerheid"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const type = e.target.value as AdvancedSeed['type'];
                  let label: AdvancedSeed['label'] = 'Valideren';
                  if (type === 'reflection') label = 'Reflectievraag';
                  else if (type === 'suggestion') label = 'Suggestie';
                  else if (type === 'intervention') label = 'Interventie';
                  else if (type === 'error') label = 'Fout';
                  
                  setFormData(prev => ({ ...prev, type, label }));
                }}
                className="w-full p-2 border rounded-md"
              >
                <option value="validation">Validatie</option>
                <option value="reflection">Reflectie</option>
                <option value="suggestion">Suggestie</option>
                <option value="intervention">Interventie</option>
                <option value="error">Fout</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Severity</label>
              <select
                value={formData.context.severity}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  context: { ...prev.context, severity: e.target.value as 'low' | 'medium' | 'high' | 'critical' }
                }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="low">Laag</option>
                <option value="medium">Gemiddeld</option>
                <option value="high">Hoog</option>
                <option value="critical">Kritiek</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.meta.weight}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  meta: { ...prev.meta, weight: parseFloat(e.target.value) || 1.0 }
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TTL (minuten)</label>
              <Input
                type="number"
                min="0"
                value={formData.meta.ttl || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  meta: { ...prev.meta, ttl: parseInt(e.target.value) || undefined }
                }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Triggers *</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={triggerInput}
                onChange={(e) => setTriggerInput(e.target.value)}
                placeholder="Voeg trigger woord toe"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTrigger())}
              />
              <Button type="button" onClick={handleAddTrigger}>
                <Plus size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.triggers.map((trigger, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTrigger(trigger)}>
                  {trigger} ×
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Response (Nederlands) *</label>
            <Textarea
              value={formData.response.nl}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                response: { ...prev.response, nl: e.target.value }
              }))}
              placeholder="De response die getoond wordt bij deze emotie"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Voeg tag toe"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag}>
                <Plus size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                  {tag} ×
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            />
            <label htmlFor="isActive" className="text-sm">Actief</label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuleren
            </Button>
            <Button type="submit">
              {seed ? 'Bijwerken' : 'Aanmaken'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdvancedSeedEditor;
