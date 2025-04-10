
import { supabase } from './supabaseClient';
import { Organizer } from '@/types';

export const getOrganizers = async (): Promise<Organizer[]> => {
  const { data, error } = await supabase
    .from('organizers')
    .select('*');
  
  if (error) {
    console.error('Error fetching organizers:', error);
    return [];
  }
  
  return data || [];
};

export const getOrganizerById = async (id: string): Promise<Organizer | undefined> => {
  const { data, error } = await supabase
    .from('organizers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching organizer:', error);
    return undefined;
  }
  
  return data;
};
