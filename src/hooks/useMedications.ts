import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Medication = Tables<'medications'>;
type MedicationInsert = TablesInsert<'medications'>;
type MedicationUpdate = TablesUpdate<'medications'>;
type MedicationLog = Tables<'medication_logs'>;

export const useMedications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: medications = [], isLoading, error } = useQuery({
    queryKey: ['medications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user!.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Medication[];
    },
    enabled: !!user,
  });

  const { data: medicationLogs = [] } = useQuery({
    queryKey: ['medication_logs', user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', user!.id)
        .gte('taken_at', today);
      
      if (error) throw error;
      return data as MedicationLog[];
    },
    enabled: !!user,
  });

  const createMedication = useMutation({
    mutationFn: async (medication: Omit<MedicationInsert, 'user_id'>) => {
      const { data, error } = await supabase
        .from('medications')
        .insert({ ...medication, user_id: user!.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  const updateMedication = useMutation({
    mutationFn: async ({ id, ...updates }: MedicationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('medications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  const deleteMedication = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  const logMedicationTaken = useMutation({
    mutationFn: async ({ medicationId, scheduledTime }: { medicationId: string; scheduledTime: string }) => {
      const { data, error } = await supabase
        .from('medication_logs')
        .insert({
          medication_id: medicationId,
          user_id: user!.id,
          scheduled_time: scheduledTime,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medication_logs'] });
    },
  });

  return {
    medications,
    medicationLogs,
    isLoading,
    error,
    createMedication,
    updateMedication,
    deleteMedication,
    logMedicationTaken,
  };
};
