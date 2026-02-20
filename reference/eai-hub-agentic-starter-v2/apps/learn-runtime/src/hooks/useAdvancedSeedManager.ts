
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { AdvancedSeed } from '../types/seed';
import {
  loadAdvancedSeeds,
  addAdvancedSeed,
  updateAdvancedSeed,
  deleteAdvancedSeed
} from '../lib/advancedSeedStorage';

export function useAdvancedSeedManager() {
  const [seedsData, setSeedsData] = useState<AdvancedSeed[]>([]);
  const [editingSeed, setEditingSeed] = useState<AdvancedSeed | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    loadSeedsData();
  }, []);

  const loadSeedsData = async () => {
    const advanced = await loadAdvancedSeeds();
    setSeedsData(advanced);
  };

  const filteredSeeds = seedsData.filter(seed => {
    const matchesSearch = seed.emotion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seed.triggers.some(trigger => trigger.toLowerCase().includes(searchTerm.toLowerCase())) ||
      seed.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || seed.type === filterType;
    const matchesSeverity = filterSeverity === 'all' || seed.context.severity === filterSeverity;
    
    return matchesSearch && matchesType && matchesSeverity;
  });

  const handleSaveSeed = async (seed: AdvancedSeed) => {
    if (editingSeed) {
      await updateAdvancedSeed(seed);
      toast({ title: "Seed bijgewerkt", description: "De advanced seed is succesvol bijgewerkt." });
    } else {
      await addAdvancedSeed(seed);
      toast({ title: "Seed toegevoegd", description: "De nieuwe advanced seed is toegevoegd." });
    }
    setEditingSeed(null);
    setIsCreating(false);
    loadSeedsData();
  };

  const handleDeleteSeed = async (seed: AdvancedSeed) => {
    await deleteAdvancedSeed(seed.id);
    toast({ title: "Seed verwijderd", description: "De advanced seed is verwijderd." });
    loadSeedsData();
  };

  const exportSeeds = () => {
    const dataStr = JSON.stringify(seedsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evai-advanced-seeds-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export voltooid", description: "Seeds zijn geëxporteerd naar JSON bestand." });
  };

  return {
    seedsData,
    editingSeed,
    setEditingSeed,
    isCreating,
    setIsCreating,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterSeverity,
    setFilterSeverity,
    filteredSeeds,
    handleSaveSeed,
    handleDeleteSeed,
    exportSeeds,
    loadSeedsData
  };
}
