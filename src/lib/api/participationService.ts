
import { supabase } from './supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { EventParticipation, ParticipationStatus } from '@/types';
import { 
  DbParticipation, 
  mapDbParticipationToParticipation,
  mapParticipationToDbParticipation 
} from './dbTypes';

export const getParticipations = async (): Promise<EventParticipation[]> => {
  const { data, error } = await supabase
    .from('participations')
    .select('*');
  
  if (error) {
    console.error('Error fetching participations:', error);
    return [];
  }
  
  return (data as DbParticipation[]).map(mapDbParticipationToParticipation);
};

export const getParticipationsByEventId = async (eventId: string): Promise<EventParticipation[]> => {
  // Получаем участия с информацией о волонтерах
  const { data, error } = await supabase
    .from('participations')
    .select('*, volunteers(name)')
    .eq('eventid', eventId);
  
  if (error) {
    console.error('Error fetching participations by event:', error);
    return [];
  }
  
  // Преобразуем данные
  return data.map(participation => ({
    id: participation.id,
    eventId: participation.eventid,
    volunteerId: participation.volunteerid,
    status: participation.status as ParticipationStatus,
    hoursLogged: participation.hourslogged,
    feedback: participation.feedback,
    volunteerName: participation.volunteers ? participation.volunteers.name : undefined
  }));
};

export const getParticipationsByVolunteerId = async (volunteerId: string): Promise<EventParticipation[]> => {
  const { data, error } = await supabase
    .from('participations')
    .select('*')
    .eq('volunteerid', volunteerId);
  
  if (error) {
    console.error('Error fetching participations by volunteer:', error);
    return [];
  }
  
  return (data as DbParticipation[]).map(mapDbParticipationToParticipation);
};

export const registerForEvent = async (eventId: string, volunteerId: string): Promise<EventParticipation | undefined> => {
  // Получаем информацию о мероприятии
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();
  
  if (eventError || !event) {
    toast({
      title: "Ошибка",
      description: "Мероприятие не найдено",
      variant: "destructive"
    });
    return undefined;
  }
  
  // Проверяем, не началось ли уже мероприятие
  if (new Date(event.startdate) <= new Date()) {
    toast({
      title: "Регистрация невозможна",
      description: "Мероприятие уже началось",
      variant: "destructive"
    });
    return undefined;
  }
  
  // Проверяем, зарегистрирован ли уже волонтер
  const { data: existingParticipation, error: participationError } = await supabase
    .from('participations')
    .select('*')
    .eq('eventid', eventId)
    .eq('volunteerid', volunteerId)
    .single();
  
  if (existingParticipation) {
    toast({
      title: "Регистрация невозможна",
      description: "Вы уже зарегистрированы на это мероприятие",
      variant: "destructive"
    });
    return undefined;
  }
  
  // Проверяем, не заполнено ли мероприятие
  if (event.currentparticipants >= event.maxparticipants) {
    toast({
      title: "Регистрация невозможна",
      description: "Мероприятие уже заполнено",
      variant: "destructive"
    });
    return undefined;
  }
  
  // Регистрируем волонтера
  const insertData = {
    eventid: eventId,
    volunteerid: volunteerId,
    status: ParticipationStatus.REGISTERED,
    hourslogged: 0
  };
  
  const { data: participation, error: insertError } = await supabase
    .from('participations')
    .insert(insertData)
    .select()
    .single();
  
  if (insertError) {
    toast({
      title: "Ошибка",
      description: "Не удалось зарегистрироваться на мероприятие",
      variant: "destructive"
    });
    return undefined;
  }
  
  // Обновляем количество участников в мероприятии
  await supabase
    .from('events')
    .update({ currentparticipants: event.currentparticipants + 1 })
    .eq('id', eventId);
  
  toast({
    title: "Успешно",
    description: "Вы успешно зарегистрировались на мероприятие",
  });
  
  return mapDbParticipationToParticipation(participation as DbParticipation);
};

export const cancelRegistration = async (eventId: string, volunteerId: string): Promise<boolean> => {
  // Находим участие
  const { data: participation, error: participationError } = await supabase
    .from('participations')
    .select('*')
    .eq('eventid', eventId)
    .eq('volunteerid', volunteerId)
    .single();
  
  if (participationError || !participation || 
      (participation.status !== ParticipationStatus.REGISTERED && 
       participation.status !== ParticipationStatus.CONFIRMED)) {
    return false;
  }
  
  // Обновляем статус участия
  const { error: updateError } = await supabase
    .from('participations')
    .update({ status: ParticipationStatus.CANCELLED })
    .eq('id', participation.id);
  
  if (updateError) {
    return false;
  }
  
  // Обновляем количество участников в мероприятии
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('currentparticipants')
    .eq('id', eventId)
    .single();
  
  if (!eventError && event && event.currentparticipants > 0) {
    await supabase
      .from('events')
      .update({ currentparticipants: event.currentparticipants - 1 })
      .eq('id', eventId);
  }
  
  toast({
    title: "Отменено",
    description: "Ваша регистрация на мероприятие была отменена",
  });
  
  return true;
};

export const confirmParticipation = async (participationId: string): Promise<EventParticipation | undefined> => {
  const { data, error } = await supabase
    .from('participations')
    .update({ status: ParticipationStatus.CONFIRMED })
    .eq('id', participationId)
    .eq('status', ParticipationStatus.REGISTERED)
    .select()
    .single();
  
  if (error) {
    return undefined;
  }
  
  return mapDbParticipationToParticipation(data as DbParticipation);
};

export const markAttended = async (participationId: string, hoursLogged: number): Promise<EventParticipation | undefined> => {
  // Обновляем участие
  const { data: participation, error: updateError } = await supabase
    .from('participations')
    .update({ 
      status: ParticipationStatus.ATTENDED,
      hourslogged: hoursLogged 
    })
    .eq('id', participationId)
    .select()
    .single();
  
  if (updateError || !participation) {
    return undefined;
  }
  
  const mappedParticipation = mapDbParticipationToParticipation(participation as DbParticipation);
  
  // Обновляем статистику волонтера
  const { data: volunteer, error: volunteerError } = await supabase
    .from('volunteers')
    .select('totalhours, eventsattended')
    .eq('id', participation.volunteerid)
    .single();
  
  if (!volunteerError && volunteer) {
    await supabase
      .from('volunteers')
      .update({ 
        totalhours: volunteer.totalhours + hoursLogged,
        eventsattended: volunteer.eventsattended + 1
      })
      .eq('id', participation.volunteerid);
  }
  
  return mappedParticipation;
};

// Новая функция для автоматического обновления статистики после завершения мероприятия
export const updateEventCompletionStatus = async () => {
  try {
    // Находим мероприятия, которые уже завершились, но всё ещё имеют статус "upcoming" или "ongoing"
    const { data: completedEvents, error: eventsError } = await supabase
      .from('events')
      .select('id, hours')
      .in('status', ['upcoming', 'ongoing'])
      .lt('enddate', new Date().toISOString());
    
    if (eventsError || !completedEvents || completedEvents.length === 0) {
      return;
    }
    
    // Обновляем статус мероприятий на "completed"
    for (const event of completedEvents) {
      // Обновляем статус мероприятия
      await supabase
        .from('events')
        .update({ status: 'completed' })
        .eq('id', event.id);
      
      // Получаем всех подтвержденных участников, которые ещё не отмечены как посетившие
      const { data: confirmedParticipations } = await supabase
        .from('participations')
        .select('id, volunteerid')
        .eq('eventid', event.id)
        .in('status', ['confirmed']);
      
      if (confirmedParticipations && confirmedParticipations.length > 0) {
        // Для каждого подтвержденного участника отмечаем посещение и часы
        for (const participation of confirmedParticipations) {
          // Отмечаем участие и логируем часы
          await markAttended(participation.id, event.hours);
        }
      }
    }
    
    console.log(`Обновлен статус для ${completedEvents.length} завершенных мероприятий`);
  } catch (error) {
    console.error('Ошибка при обновлении статуса завершенных мероприятий:', error);
  }
};

// Запускаем проверку при инициализации сервиса
updateEventCompletionStatus();
