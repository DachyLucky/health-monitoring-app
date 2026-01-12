import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Appointment = Tables<'appointments'>;
type AppointmentInsert = TablesInsert<'appointments'>;
type AppointmentUpdate = TablesUpdate<'appointments'>;

export const useAppointments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ['appointments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user!.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });
      
      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!user,
  });

  const createAppointment = useMutation({
    mutationFn: async (appointment: Omit<AppointmentInsert, 'user_id'>) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert({ ...appointment, user_id: user!.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const updateAppointment = useMutation({
    mutationFn: async ({ id, ...updates }: AppointmentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  return {
    appointments,
    isLoading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  };
};
