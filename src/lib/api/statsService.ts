
import { supabase } from './supabaseClient';
import { EventCategory, VolunteerStats, ParticipationStatus } from '@/types';

export const getVolunteerStats = async (volunteerId: string): Promise<VolunteerStats> => {
  try {
    // Сначала обновляем данные волонтера из таблицы volunteers
    const { data: volunteer, error: volunteerError } = await supabase
      .from('volunteers')
      .select('*')
      .eq('id', volunteerId)
      .single();
    
    if (volunteerError) {
      console.error('Error fetching volunteer data:', volunteerError);
      throw volunteerError;
    }
    
    // Получаем участия волонтера
    const { data: participations, error: participationsError } = await supabase
      .from('participations')
      .select('*, events(*)')
      .eq('volunteerid', volunteerId);
  
    if (participationsError) {
      console.error('Error fetching volunteer participations:', participationsError);
      return {
        totalEvents: volunteer.eventsattended || 0,
        totalHours: volunteer.totalhours || 0,
        categoriesParticipated: {
          [EventCategory.ENVIRONMENT]: 0,
          [EventCategory.EDUCATION]: 0,
          [EventCategory.HEALTH]: 0,
          [EventCategory.COMMUNITY]: 0,
          [EventCategory.ANIMAL]: 0,
          [EventCategory.OTHER]: 0
        },
        upcomingEvents: 0
      };
    }
    
    // Инициализация статистики
    const stats: VolunteerStats = {
      totalEvents: volunteer.eventsattended || 0,
      totalHours: volunteer.totalhours || 0,
      categoriesParticipated: {
        [EventCategory.ENVIRONMENT]: 0,
        [EventCategory.EDUCATION]: 0,
        [EventCategory.HEALTH]: 0,
        [EventCategory.COMMUNITY]: 0,
        [EventCategory.ANIMAL]: 0,
        [EventCategory.OTHER]: 0
      },
      upcomingEvents: 0
    };
    
    if (!participations) return stats;
    
    // Считаем предстоящие мероприятия
    const upcomingParticipations = participations.filter(
      p => (p.status === ParticipationStatus.REGISTERED || 
           p.status === ParticipationStatus.CONFIRMED) &&
           p.events && 
           (p.events.status === 'upcoming' || p.events.status === 'ongoing')
    );
    
    stats.upcomingEvents = upcomingParticipations.length;
    
    // Считаем участие по категориям
    const attendedParticipations = participations.filter(p => p.status === ParticipationStatus.ATTENDED);
    
    attendedParticipations.forEach(p => {
      if (p.events && p.events.category) {
        // Cast the string category from DB to the EventCategory enum
        const category = p.events.category as EventCategory;
        if (Object.values(EventCategory).includes(category)) {
          stats.categoriesParticipated[category] += 1;
        }
      }
    });
    
    // Рассчитываем ранг и уровень на основе фактических данных
    if (stats.totalHours < 10) {
      stats.level = "Начинающий";
    } else if (stats.totalHours < 30) {
      stats.level = "Опытный";
    } else {
      stats.level = "Эксперт";
    }
    
    // Расчет ранга на основе позиции среди других волонтеров
    try {
      const { data: allVolunteers } = await supabase
        .from('volunteers')
        .select('id, totalhours')
        .order('totalhours', { ascending: false });
      
      if (allVolunteers && allVolunteers.length > 0) {
        const volunteerIndex = allVolunteers.findIndex(v => v.id === volunteerId);
        stats.rank = volunteerIndex !== -1 ? volunteerIndex + 1 : allVolunteers.length;
      } else {
        stats.rank = 1;
      }
    } catch (error) {
      console.error('Error calculating rank:', error);
      stats.rank = 1;
    }
    
    return stats;
  } catch (error) {
    console.error('Error in getVolunteerStats:', error);
    throw error;
  }
};
