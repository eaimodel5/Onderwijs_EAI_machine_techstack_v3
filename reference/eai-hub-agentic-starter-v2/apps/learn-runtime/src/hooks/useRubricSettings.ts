
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type RubricStrictnessLevel = 'flexible' | 'moderate' | 'strict';

export interface RubricStrictnessConfig {
  level: RubricStrictnessLevel;
  thresholds: {
    riskAlert: number;
    overallRiskHigh: number;
    overallRiskModerate: number;
    protectiveFactorsMin: number;
    interventionTrigger: number;
  };
  weights: {
    riskMultiplier: number;
    protectiveMultiplier: number;
  };
}

const STRICTNESS_CONFIGS: Record<RubricStrictnessLevel, RubricStrictnessConfig> = {
  flexible: {
    level: 'flexible',
    thresholds: {
      riskAlert: 3.0,
      overallRiskHigh: 70,
      overallRiskModerate: 40,
      protectiveFactorsMin: 2,
      interventionTrigger: 2.5
    },
    weights: {
      riskMultiplier: 0.8,
      protectiveMultiplier: 1.2
    }
  },
  moderate: {
    level: 'moderate',
    thresholds: {
      riskAlert: 2.0,
      overallRiskHigh: 60,
      overallRiskModerate: 30,
      protectiveFactorsMin: 3,
      interventionTrigger: 2.0
    },
    weights: {
      riskMultiplier: 1.0,
      protectiveMultiplier: 1.0
    }
  },
  strict: {
    level: 'strict',
    thresholds: {
      riskAlert: 1.5,
      overallRiskHigh: 50,
      overallRiskModerate: 20,
      protectiveFactorsMin: 4,
      interventionTrigger: 1.5
    },
    weights: {
      riskMultiplier: 1.3,
      protectiveMultiplier: 0.8
    }
  }
};

export function useRubricSettings() {
  const [config, setConfig] = useState<RubricStrictnessConfig>(STRICTNESS_CONFIGS.flexible);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    console.log('🔧 Loading rubric settings...');
    try {
      // First try to get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ Auth error:', userError);
        setIsLoading(false);
        return;
      }

      if (!user) {
        console.log('⚠️ No authenticated user found');
        setIsLoading(false);
        return;
      }

      console.log('👤 Current user:', user.id);

      // Use the new user-specific function
      console.log('🔍 Attempting user-specific settings query...');
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_setting', {
        setting_key: 'rubric_strictness',
        default_value: 'flexible'
      });

      if (rpcError) {
        console.error('❌ RPC function error:', rpcError);
        console.log('⚠️ Using default configuration');
      } else {
        console.log('✅ RPC function success:', rpcData);
        const level = (rpcData as RubricStrictnessLevel) || 'flexible';
        setConfig(STRICTNESS_CONFIGS[level] || STRICTNESS_CONFIGS.flexible);
      }
    } catch (error) {
      console.error('❌ Failed to load rubric settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStrictness = async (level: RubricStrictnessLevel) => {
    console.log('💾 Updating rubric strictness to:', level);
    
    try {
      // Use the new user-specific function
      console.log('🔄 Attempting user-specific settings update...');
      const { error: rpcError } = await supabase.rpc('update_user_setting', {
        setting_key: 'rubric_strictness',
        setting_value: level
      });

      if (rpcError) {
        console.error('❌ RPC update error:', rpcError);
        return false;
      } else {
        console.log('✅ RPC update success');
      }

      // Update local state on success
      setConfig(STRICTNESS_CONFIGS[level]);
      console.log('✅ Local state updated to:', level);
      return true;
    } catch (error) {
      console.error('❌ Failed to update rubric settings:', error);
      return false;
    }
  };

  return {
    config,
    isLoading,
    updateStrictness,
    availableLevels: Object.keys(STRICTNESS_CONFIGS) as RubricStrictnessLevel[]
  };
}
