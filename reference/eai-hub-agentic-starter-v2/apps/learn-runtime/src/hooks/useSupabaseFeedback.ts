import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export function useSeedFeedback(seedId: string) {
  return useQuery({
    queryKey: ['seed-feedback', seedId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seed_feedback')
        .select('*')
        .eq('seed_id', seedId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    }
  })
}

export function useSeedRubrics(seedId: string) {
  return useQuery({
    queryKey: ['seed-rubrics', seedId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seed_rubrics')
        .select('*')
        .eq('seed_id', seedId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    }
  })
}

export function useRubrics() {
  return useQuery({
    queryKey: ['rubrics'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rubrics').select('*')
      if (error) throw error
      return data ?? []
    }
  })
}
