
import StatCard from "@/components/StatCard";
import { CalendarDays, Clock, Award, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getUpcomingEvents, getParticipationsByVolunteerId } from "@/lib/dataService";
import { Event, Volunteer, VolunteerStats, EventParticipation, ParticipationStatus } from "@/types";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getVolunteerStats } from "@/lib/api/statsService";
import { updateEventCompletionStatus } from "@/lib/api/participationService";

const Index = () => {
  const { volunteer } = useAuth();
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [userParticipations, setUserParticipations] = useState<EventParticipation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!volunteer) return;
      
      // Обновляем статусы завершенных мероприятий
      await updateEventCompletionStatus();
      
      // Получаем статистику волонтера из обновленного сервиса
      const userStats = await getVolunteerStats(volunteer.id);
      setStats(userStats);
      
      // Получаем предстоящие мероприятия
      const events = await getUpcomingEvents();
      setUpcomingEvents(events);
      
      // Получаем участия волонтера
      const participations = await getParticipationsByVolunteerId(volunteer.id);
      setUserParticipations(participations);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (volunteer) {
      fetchData();
    }
  }, [volunteer]);

  const isRegistered = (eventId: string) => {
    return userParticipations.some(p => p.eventId === eventId);
  };

  const getParticipationStatus = (eventId: string) => {
    const participation = userParticipations.find(p => p.eventId === eventId);
    return participation?.status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-6 px-4 md:px-0">
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Статистика</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Посещенных мероприятий" 
              value={stats?.totalEvents || 0}
              icon={<CalendarDays size={24} className="text-volunteer-purple" />}
            />
            
            <StatCard 
              title="Волонтерских часов" 
              value={stats?.totalHours || 0}
              icon={<Clock size={24} className="text-volunteer-purple" />}
            />
            
            <StatCard 
              title="Уровень" 
              value={stats?.level || "Начинающий"}
              icon={<Award size={24} className="text-volunteer-purple" />}
            />
            
            <StatCard 
              title="Место в рейтинге" 
              value={`#${stats?.rank || "--"}`}
              icon={<Users size={24} className="text-volunteer-purple" />}
            />
          </div>
        </section>
        
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Предстоящие мероприятия</h2>
            <Link to="/events">
              <Button variant="outline">Все мероприятия</Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Загрузка данных...</p>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">Нет предстоящих мероприятий</h3>
              <p className="text-gray-600 mb-4">
                На данный момент нет запланированных мероприятий для участия.
              </p>
              <Link to="/events">
                <Button>Посмотреть все мероприятия</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.slice(0, 3).map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  isRegistered={isRegistered(event.id)}
                  participationStatus={getParticipationStatus(event.id)}
                  volunteerId={volunteer?.id || ""}
                  onActionComplete={fetchData}
                />
              ))}
              
              {upcomingEvents.length > 3 && (
                <div className="text-center mt-6">
                  <Link to="/events">
                    <Button variant="outline">Показать больше мероприятий</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
