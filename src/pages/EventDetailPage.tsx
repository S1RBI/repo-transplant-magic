import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User, 
  ArrowLeft, 
  Edit, 
  Trash2 
} from "lucide-react";
import { 
  getEventById, 
  getParticipationsByEventId, 
  getParticipationsByVolunteerId, 
  getCurrentUser,
  registerForEvent,
  cancelRegistration,
  deleteEvent
} from "@/lib/dataService";
import { 
  Event, 
  EventParticipation, 
  Volunteer, 
  ParticipationStatus, 
  EventCategory,
  EventStatus 
} from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EventForm from "@/components/EventForm";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [participations, setParticipations] = useState<EventParticipation[]>([]);
  const [userParticipation, setUserParticipation] = useState<EventParticipation | null>(null);
  const [currentUser, setCurrentUser] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      if (!id) return;
      
      const eventData = await getEventById(id);
      setEvent(eventData || null);
      
      if (eventData) {
        const eventParticipations = await getParticipationsByEventId(eventData.id);
        setParticipations(eventParticipations);
        
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        const userParticipations = await getParticipationsByVolunteerId(user.id);
        const participation = userParticipations.find(p => p.eventId === eventData.id);
        setUserParticipation(participation || null);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      toast({ 
        title: "Ошибка", 
        description: "Не удалось загрузить данные мероприятия", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleRegister = async () => {
    if (!event || !currentUser) return;
    
    setActionLoading(true);
    await registerForEvent(event.id, currentUser.id);
    setActionLoading(false);
    fetchData();
  };

  const handleCancelRegistration = async () => {
    if (!event || !currentUser) return;
    
    setActionLoading(true);
    await cancelRegistration(event.id, currentUser.id);
    setActionLoading(false);
    fetchData();
  };

  const handleDeleteEvent = async () => {
    if (!event) return;
    
    setActionLoading(true);
    const success = await deleteEvent(event.id);
    setActionLoading(false);
    
    if (success) {
      toast({ title: "Успех", description: "Мероприятие удалено" });
      navigate("/events");
    } else {
      toast({ 
        title: "Ошибка", 
        description: "Не удалось удалить мероприятие", 
        variant: "destructive" 
      });
    }
  };

  const handleEventUpdated = () => {
    setShowEditDialog(false);
    fetchData();
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

  const getCategoryColor = (category: EventCategory) => {
    switch (category) {
      case EventCategory.ENVIRONMENT:
        return "bg-green-100 text-green-800";
      case EventCategory.EDUCATION:
        return "bg-blue-100 text-blue-800";
      case EventCategory.HEALTH:
        return "bg-red-100 text-red-800";
      case EventCategory.COMMUNITY:
        return "bg-yellow-100 text-yellow-800";
      case EventCategory.ANIMAL:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusName = (status: EventStatus) => {
    switch (status) {
      case EventStatus.UPCOMING:
        return "Предстоящее";
      case EventStatus.ONGOING:
        return "В процессе";
      case EventStatus.COMPLETED:
        return "Завершено";
      case EventStatus.CANCELLED:
        return "Отменено";
      default:
        return status;
    }
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.UPCOMING:
        return "bg-blue-100 text-blue-800";
      case EventStatus.ONGOING:
        return "bg-green-100 text-green-800";
      case EventStatus.COMPLETED:
        return "bg-gray-100 text-gray-800";
      case EventStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isCompletedOrPast = event?.status === EventStatus.COMPLETED || 
                          event?.status === EventStatus.CANCELLED ||
                          (event && new Date(event.endDate) < new Date());

  const hasStarted = event && new Date(event.startDate) <= new Date() && 
                    new Date(event.endDate) > new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto py-6 px-4 md:px-0">
          <div className="flex justify-center items-center h-64">
            <p>Загрузка данных мероприятия...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto py-6 px-4 md:px-0">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Мероприятие не найдено</h3>
            <p className="text-gray-600 mb-4">
              Запрашиваемое мероприятие не существует или было удалено.
            </p>
            <Link to="/events">
              <Button>Вернуться к списку мероприятий</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const formattedStartDate = format(startDate, 'dd MMMM yyyy, HH:mm', { locale: ru });
  const formattedEndDate = format(endDate, 'dd MMMM yyyy, HH:mm', { locale: ru });

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-6 px-4 md:px-0">
        <div className="mb-6">
          <Link to="/events" className="inline-flex items-center text-volunteer-purple hover:underline">
            <ArrowLeft size={16} className="mr-1" />
            Назад к списку мероприятий
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{event.title}</h1>
                <Badge className={getCategoryColor(event.category)}>
                  {getCategoryName(event.category)}
                </Badge>
                <Badge className={getStatusColor(event.status)}>
                  {getStatusName(event.status)}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">Организатор: {event.organizer}</p>
            </div>
            
            <div className="flex gap-2">
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit size={16} className="mr-1" />
                    Редактировать
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Редактирование мероприятия</DialogTitle>
                  </DialogHeader>
                  <EventForm event={event} onSuccess={handleEventUpdated} />
                </DialogContent>
              </Dialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 size={16} className="mr-1" />
                    Удалить
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это действие нельзя отменить. Мероприятие будет удалено навсегда.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteEvent}
                      disabled={actionLoading}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center">
              <Calendar size={20} className="text-volunteer-purple mr-3" />
              <div>
                <p className="text-sm text-gray-500">Дата начала</p>
                <p>{formattedStartDate}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Calendar size={20} className="text-volunteer-purple mr-3" />
              <div>
                <p className="text-sm text-gray-500">Дата окончания</p>
                <p>{formattedEndDate}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock size={20} className="text-volunteer-purple mr-3" />
              <div>
                <p className="text-sm text-gray-500">Продолжительность</p>
                <p>{event.hours} часов</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <MapPin size={20} className="text-volunteer-purple mr-3" />
              <div>
                <p className="text-sm text-gray-500">Место проведения</p>
                <p>{event.location}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Users size={20} className="text-volunteer-purple mr-3" />
              <div>
                <p className="text-sm text-gray-500">Участники</p>
                <p>{event.currentParticipants} из {event.maxParticipants}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <User size={20} className="text-volunteer-purple mr-3" />
              <div>
                <p className="text-sm text-gray-500">Ваш статус</p>
                <p>
                  {userParticipation ? (
                    userParticipation.status === ParticipationStatus.REGISTERED ? "Зарегистрирован" :
                    userParticipation.status === ParticipationStatus.CONFIRMED ? "Подтвержден" :
                    userParticipation.status === ParticipationStatus.ATTENDED ? "Участвовал" :
                    userParticipation.status === ParticipationStatus.CANCELLED ? "Отменено" :
                    userParticipation.status === ParticipationStatus.NO_SHOW ? "Не явился" :
                    "Неизвестно"
                  ) : "Не зарегистрирован"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Описание</h2>
            <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
          </div>
          
          <div className="flex justify-end">
            {!userParticipation && !isCompletedOrPast && !hasStarted && (
              <Button 
                onClick={handleRegister}
                disabled={event.currentParticipants >= event.maxParticipants || actionLoading}
              >
                Зарегистрироваться
              </Button>
            )}
            
            {userParticipation && 
             (userParticipation.status === ParticipationStatus.REGISTERED || 
              userParticipation.status === ParticipationStatus.CONFIRMED) && 
             !isCompletedOrPast && (
              <Button 
                variant="destructive"
                onClick={handleCancelRegistration}
                disabled={actionLoading}
              >
                Отменить регистрацию
              </Button>
            )}
            
            {isCompletedOrPast && !userParticipation && (
              <Badge variant="secondary" className="text-base py-2 px-4">
                Мероприятие завершено
              </Badge>
            )}
            
            {hasStarted && !userParticipation && (
              <Badge variant="secondary" className="text-base py-2 px-4">
                Мероприятие уже началось
              </Badge>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Участники ({participations.length})</h2>
          
          {participations.length === 0 ? (
            <p className="text-gray-500">Пока нет зарегистрированных участников</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 pr-4">№</th>
                    <th className="pb-3 pr-4">Участник</th>
                    <th className="pb-3 pr-4">Статус</th>
                    <th className="pb-3">Часы</th>
                  </tr>
                </thead>
                <tbody>
                  {participations.map((participation, index) => (
                    <tr key={participation.id} className="border-b">
                      <td className="py-3 pr-4">{index + 1}</td>
                      <td className="py-3 pr-4">{participation.volunteerName || "Волонтер"}</td>
                      <td className="py-3 pr-4">
                        <Badge className={
                          participation.status === ParticipationStatus.REGISTERED ? "bg-blue-100 text-blue-800" :
                          participation.status === ParticipationStatus.CONFIRMED ? "bg-green-100 text-green-800" :
                          participation.status === ParticipationStatus.ATTENDED ? "bg-volunteer-purple text-white" :
                          participation.status === ParticipationStatus.CANCELLED ? "bg-red-100 text-red-800" :
                          participation.status === ParticipationStatus.NO_SHOW ? "bg-gray-100 text-gray-800" :
                          "bg-gray-100 text-gray-800"
                        }>
                          {participation.status === ParticipationStatus.REGISTERED ? "Зарегистрирован" :
                          participation.status === ParticipationStatus.CONFIRMED ? "Подтвержден" :
                          participation.status === ParticipationStatus.ATTENDED ? "Участвовал" :
                          participation.status === ParticipationStatus.CANCELLED ? "Отменено" :
                          participation.status === ParticipationStatus.NO_SHOW ? "Не явился" :
                          participation.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {participation.status === ParticipationStatus.ATTENDED 
                          ? `${participation.hoursLogged} ч.` 
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventDetailPage;
