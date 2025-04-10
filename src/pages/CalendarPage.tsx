import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Event, Volunteer, EventParticipation, ParticipationStatus } from "@/types";
import { getEvents, getCurrentUser, getParticipationsByVolunteerId } from "@/lib/dataService";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [currentUser, setCurrentUser] = useState<Volunteer | null>(null);
  const [userParticipations, setUserParticipations] = useState<EventParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const eventsData = await getEvents();
        setEvents(eventsData);
        
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        const participations = await getParticipationsByVolunteerId(user.id);
        setUserParticipations(participations);
        
        if (date) {
          filterEventsByDate(date, eventsData);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filterEventsByDate = (selectedDate: Date, eventsList = events) => {
    const filteredEvents = eventsList.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getDate() === selectedDate.getDate() &&
            eventDate.getMonth() === selectedDate.getMonth() &&
            eventDate.getFullYear() === selectedDate.getFullYear();
    });
    
    setSelectedDateEvents(filteredEvents);
  };

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      filterEventsByDate(newDate);
    } else {
      setSelectedDateEvents([]);
    }
  };

  const hasEventsOnDate = (day: Date) => {
    return events.some(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getDate() === day.getDate() &&
            eventDate.getMonth() === day.getMonth() &&
            eventDate.getFullYear() === day.getFullYear();
    });
  };

  const hasRegisteredEventsOnDate = (day: Date) => {
    if (!userParticipations.length) return false;
    
    const eventIds = userParticipations
      .filter(p => 
        p.status === ParticipationStatus.REGISTERED || 
        p.status === ParticipationStatus.CONFIRMED
      )
      .map(p => p.eventId);
    
    return events.some(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getDate() === day.getDate() &&
            eventDate.getMonth() === day.getMonth() &&
            eventDate.getFullYear() === day.getFullYear() &&
            eventIds.includes(event.id);
    });
  };

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
        <h1 className="text-3xl font-bold mb-6">Календарь мероприятий</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <Card>
              <CardContent className="p-0">
                <div className="p-6">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    className="pointer-events-auto"
                    modifiersClassNames={{
                      selected: 'bg-volunteer-purple text-white',
                    }}
                    modifiers={{
                      eventDay: (day) => hasEventsOnDate(day),
                      registeredDay: (day) => hasRegisteredEventsOnDate(day),
                    }}
                    modifiersStyles={{
                      eventDay: { 
                        textDecoration: 'underline', 
                        fontWeight: 'bold',
                      },
                      registeredDay: { 
                        border: '2px solid #9b87f5', 
                      },
                    }}
                    locale={ru}
                    showOutsideDays
                  />
                </div>
                <div className="px-6 pb-6 flex gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-volunteer-purple rounded-full"></div>
                    <span className="text-sm text-gray-600">Выбранная дата</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-volunteer-purple rounded-full"></div>
                    <span className="text-sm text-gray-600">Вы зарегистрированы</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white underline font-bold">1</div>
                    <span className="text-sm text-gray-600">Есть мероприятия</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-5">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {date ? format(date, "d MMMM yyyy", { locale: ru }) : "Выберите дату"}
                </h2>
                
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <p>Загрузка данных...</p>
                  </div>
                ) : selectedDateEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Info className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium mb-1">Нет мероприятий</h3>
                    <p className="text-gray-500">
                      На выбранную дату нет запланированных мероприятий
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateEvents.map(event => (
                      <div 
                        key={event.id} 
                        className={cn(
                          "p-4 rounded-md border border-gray-200",
                          isRegistered(event.id) ? "bg-volunteer-light-purple" : "bg-white"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <span className="text-sm text-gray-500">
                            {format(new Date(event.startDate), "HH:mm", { locale: ru })}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                          {event.description}
                        </p>
                        
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-sm text-gray-500">{event.location}</span>
                          
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">Подробности</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-medium">{event.title}</h4>
                                <p className="text-sm text-gray-600">{event.description}</p>
                                <div className="text-sm">
                                  <p><span className="font-medium">Организатор:</span> {event.organizer}</p>
                                  <p><span className="font-medium">Часы:</span> {event.hours}</p>
                                  <p>
                                    <span className="font-medium">Участников:</span> {event.currentParticipants}/{event.maxParticipants}
                                  </p>
                                  <p>
                                    <span className="font-medium">Ваш статус:</span>{" "}
                                    {isRegistered(event.id) 
                                      ? getParticipationStatus(event.id) === ParticipationStatus.REGISTERED
                                        ? "Зарегистрирован"
                                        : getParticipationStatus(event.id) === ParticipationStatus.CONFIRMED
                                        ? "Подтвержден"
                                        : "Участник" 
                                      : "Не зарегистрирован"
                                    }
                                  </p>
                                </div>
                                <div className="pt-2">
                                  <Link to={`/events/${event.id}`}>
                                    <Button className="w-full">Перейти к мероприятию</Button>
                                  </Link>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
