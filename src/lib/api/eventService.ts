
import { supabase } from './supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Event, EventStatus } from '@/types';
import { 
  DbEvent, 
  mapDbEventToEvent, 
  mapEventToDbEvent 
} from './dbTypes';

export const getEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*');
  
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  
  return (data as DbEvent[]).map(mapDbEventToEvent);
};

export const getEventById = async (id: string): Promise<Event | undefined> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching event:', error);
    return undefined;
  }
  
  return mapDbEventToEvent(data as DbEvent);
};

export const getUpcomingEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', EventStatus.UPCOMING);
  
  if (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
  
  return (data as DbEvent[]).map(mapDbEventToEvent);
};

export const getCompletedEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', EventStatus.COMPLETED);
  
  if (error) {
    console.error('Error fetching completed events:', error);
    return [];
  }
  
  return (data as DbEvent[]).map(mapDbEventToEvent);
};

export const createEvent = async (eventData: Omit<Event, 'id'>): Promise<Event> => {
  const dbEventData = mapEventToDbEvent(eventData);
  
  // Create a properly typed insert object with all required fields
  const insertData = {
    title: eventData.title,
    description: eventData.description,
    location: eventData.location,
    startdate: eventData.startDate,
    enddate: eventData.endDate,
    maxparticipants: eventData.maxParticipants,
    currentparticipants: eventData.currentParticipants || 0,
    organizerid: eventData.organizerId,
    organizer: eventData.organizer,
    organizerlogo: eventData.organizerLogo,
    category: eventData.category,
    status: eventData.status || EventStatus.UPCOMING,
    hours: eventData.hours
  };
  
  const { data, error } = await supabase
    .from('events')
    .insert(insertData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event');
  }
  
  return mapDbEventToEvent(data as DbEvent);
};

export const updateEvent = async (eventId: string, eventData: Partial<Event>): Promise<Event | undefined> => {
  const dbEventData = mapEventToDbEvent(eventData);
  
  const { data, error } = await supabase
    .from('events')
    .update(dbEventData)
    .eq('id', eventId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating event:', error);
    return undefined;
  }
  
  return mapDbEventToEvent(data as DbEvent);
};

export const deleteEvent = async (eventId: string): Promise<boolean> => {
  // Сначала удаляем все связанные участия
  const { error: participationError } = await supabase
    .from('participations')
    .delete()
    .eq('eventid', eventId);
  
  if (participationError) {
    console.error('Error deleting event participations:', participationError);
    return false;
  }
  
  // Затем удаляем само мероприятие
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);
  
  if (error) {
    console.error('Error deleting event:', error);
    return false;
  }
  
  return true;
};
