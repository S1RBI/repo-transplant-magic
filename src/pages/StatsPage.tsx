
import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import { CalendarDays, Clock, Award, Users, Flame } from "lucide-react";
import { getVolunteerStats, getCurrentUser, getParticipationsByVolunteerId } from "@/lib/dataService";
import { Volunteer, VolunteerStats, EventCategory, EventParticipation, ParticipationStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { formatDistanceToNow, format } from 'date-fns';
import { ru } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

const StatsPage = () => {
  const [currentUser, setCurrentUser] = useState<Volunteer | null>(null);
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [participations, setParticipations] = useState<EventParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsData, setEventsData] = useState<any[]>([]);
  const [hoursData, setHoursData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        const userStats = await getVolunteerStats(user.id);
        setStats(userStats);
        
        const userParticipations = await getParticipationsByVolunteerId(user.id);
        setParticipations(userParticipations);
        
        if (userParticipations.length > 0) {
          const { data: eventsInfo } = await supabase
            .from('events')
            .select('id, title, startdate, category, hours')
            .in('id', userParticipations.map(p => p.eventId));
          
          if (eventsInfo) {
            const combinedData = userParticipations.map(participation => {
              const eventInfo = eventsInfo.find(e => e.id === participation.eventId);
              return {
                ...participation,
                eventTitle: eventInfo ? eventInfo.title : 'Неизвестное мероприятие',
                eventDate: eventInfo ? eventInfo.startdate : null,
                eventCategory: eventInfo ? eventInfo.category : null,
                eventHours: eventInfo ? eventInfo.hours : 0
              };
            });
            
            combinedData.sort((a, b) => {
              if (a.eventDate && b.eventDate) {
                return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
              }
              return 0;
            });
            
            setEventsData(combinedData);
            
            // Calculate hours by category for the chart
            const hoursByCategory: Record<string, number> = {};
            combinedData.forEach(event => {
              if (event.status === ParticipationStatus.ATTENDED && event.eventCategory) {
                const category = event.eventCategory as string;
                const hours = event.hoursLogged || 0;
                
                if (!hoursByCategory[category]) {
                  hoursByCategory[category] = 0;
                }
                hoursByCategory[category] += hours;
              }
            });
            
            const hoursChartData = Object.entries(hoursByCategory).map(([category, hours]) => ({
              name: getCategoryName(category as EventCategory),
              value: hours
            }));
            
            setHoursData(hoursChartData);
          }
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const prepareCategoriesData = () => {
    if (!stats) return [];
    
    return Object.entries(stats.categoriesParticipated)
      .filter(([, count]) => count > 0)
      .map(([category, count]) => ({
        name: getCategoryName(category as EventCategory),
        value: count
      }));
  };

  const getCategoryName = (category: EventCategory) => {
    switch (category) {
      case EventCategory.ENVIRONMENT:
        return "Экология";
      case EventCategory.EDUCATION:
        return "Образование";
      case EventCategory.HEALTH:
        return "Здоровье";
      case EventCategory.COMMUNITY:
        return "Сообщество";
      case EventCategory.ANIMAL:
        return "Животные";
      default:
        return "Другое";
    }
  };

  const getStatusText = (status: ParticipationStatus) => {
    switch (status) {
      case ParticipationStatus.REGISTERED:
        return "Зарегистрирован";
      case ParticipationStatus.CONFIRMED:
        return "Подтвержден";
      case ParticipationStatus.ATTENDED:
        return "Участвовал";
      case ParticipationStatus.CANCELLED:
        return "Отменен";
      case ParticipationStatus.NO_SHOW:
        return "Не явился";
      default:
        return "Неизвестно";
    }
  };

  const COLORS = ['#9b87f5', '#7E69AB', '#F2FCE2', '#FEF7CD', '#E5DEFF', '#D6BCFA'];

  const getLevelProgress = () => {
    if (!stats) return 0;
    
    if (stats.level === "Начинающий") {
      return (stats.totalHours / 10) * 100;
    } else if (stats.level === "Опытный") {
      return ((stats.totalHours - 10) / 20) * 100;
    } else {
      return 100;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-6 px-4 md:px-0">
        <h1 className="text-3xl font-bold mb-6">Статистика волонтера</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Загрузка статистики...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                description={`Прогресс: ${Math.round(getLevelProgress())}%`}
                icon={<Award size={24} className="text-volunteer-purple" />}
              />
              
              <StatCard 
                title="Место в рейтинге" 
                value={`#${stats?.rank || "--"}`}
                icon={<Users size={24} className="text-volunteer-purple" />}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Flame className="h-5 w-5 mr-2 text-volunteer-purple" />
                    Активность по категориям
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    {stats && prepareCategoriesData().length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareCategoriesData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {prepareCategoriesData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-gray-500">Нет данных для отображения</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-volunteer-purple" />
                    Часы по категориям
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    {hoursData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={hoursData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Часы" fill="#9b87f5" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-gray-500">Нет данных для отображения</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">История активности</h2>
              
              {eventsData.length === 0 ? (
                <p className="text-gray-500">Пока нет записей об активности</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Дата</TableHead>
                        <TableHead>Мероприятие</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Часы</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventsData.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            {event.eventDate ? format(new Date(event.eventDate), 'dd.MM.yyyy') : 'Н/Д'}
                          </TableCell>
                          <TableCell>{event.eventTitle}</TableCell>
                          <TableCell>{getStatusText(event.status)}</TableCell>
                          <TableCell>{event.status === ParticipationStatus.ATTENDED ? event.hoursLogged : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default StatsPage;
