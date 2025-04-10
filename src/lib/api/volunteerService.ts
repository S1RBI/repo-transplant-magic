
import { supabase } from './supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Volunteer } from '@/types';
import { 
  DbVolunteer, 
  mapDbVolunteerToVolunteer, 
  mapVolunteerToDbVolunteer 
} from './dbTypes';

export const getVolunteers = async (): Promise<Volunteer[]> => {
  const { data, error } = await supabase
    .from('volunteers')
    .select('*');
  
  if (error) {
    console.error('Error fetching volunteers:', error);
    return [];
  }
  
  return (data as DbVolunteer[]).map(mapDbVolunteerToVolunteer);
};

export const getVolunteerById = async (id: string): Promise<Volunteer | undefined> => {
  const { data, error } = await supabase
    .from('volunteers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching volunteer:', error);
    return undefined;
  }
  
  return mapDbVolunteerToVolunteer(data as DbVolunteer);
};

export const createVolunteerProfile = async (userId: string, name: string, email: string): Promise<boolean> => {
  try {
    console.log('Creating volunteer profile with data:', { userId, name, email });
    
    const { error } = await supabase
      .from('volunteers')
      .insert({
        id: userId,
        name: name,
        email: email,
        skills: [],
        joineddate: new Date().toISOString(),
        totalhours: 0,
        eventsattended: 0
      });
    
    if (error) {
      console.error('Error creating volunteer profile:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to create volunteer profile:', error);
    return false;
  }
};

export const getCurrentUser = async (): Promise<Volunteer> => {
  // Получаем текущего пользователя из сессии Supabase
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Получаем дополнительные данные о пользователе из таблицы volunteers
  const { data, error } = await supabase
    .from('volunteers')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error || !data) {
    // Если данных о волонтере нет, создаем запись с базовыми данными
    const newVolunteer: Volunteer = {
      id: user.id,
      name: user.user_metadata?.full_name || 'Волонтер',
      email: user.email || '',
      skills: [],
      joinedDate: new Date().toISOString(),
      totalHours: 0,
      eventsAttended: 0
    };
    
    // Сохраняем нового волонтера в базу
    const result = await createVolunteerProfile(user.id, newVolunteer.name, newVolunteer.email);
    
    if (!result) {
      throw new Error('Failed to create volunteer profile');
    }
    
    return newVolunteer;
  }
  
  return mapDbVolunteerToVolunteer(data as DbVolunteer);
};
