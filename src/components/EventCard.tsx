
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Event, EventCategory, EventStatus, ParticipationStatus } from "@/types";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ru } from "date-fns/locale";
import { Link } from "react-router-dom";
import { cancelRegistration, registerForEvent } from "@/lib/dataService";
import { useState } from "react";

interface EventCardProps {
  event: Event;
  isRegistered?: boolean;
  participationStatus?: ParticipationStatus;
  volunteerId: string;
  onActionComplete?: () => void;
}

const EventCard = ({ 
  event, 
  isRegistered = false, 
  participationStatus,
  volunteerId,
  onActionComplete 
}: EventCardProps) => {
  const [loading, setLoading] = useState(false);

  // Get badge color based on category
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

  const handleRegister = async () => {
    setLoading(true);
    await registerForEvent(event.id, volunteerId);
    setLoading(false);
    if (onActionComplete) onActionComplete();
  };

  const handleCancel = async () => {
    setLoading(true);
    await cancelRegistration(event.id, volunteerId);
    setLoading(false);
    if (onActionComplete) onActionComplete();
  };

  const startDate = new Date(event.startDate);
  const formattedDate = format(startDate, 'dd MMMM yyyy', { locale: ru });
  const formattedTime = format(startDate, 'HH:mm', { locale: ru });
  const timeAgo = formatDistanceToNow(startDate, { addSuffix: true, locale: ru });

  // Check if event is in the past, completed, or already started
  const isCompletedOrPast = event.status === EventStatus.COMPLETED || 
                          event.status === EventStatus.CANCELLED ||
                          new Date(event.endDate) < new Date();
                          
  // Check if event has already started but not ended
  const hasStarted = new Date(event.startDate) <= new Date() && 
                    new Date(event.endDate) > new Date();

  return (
    <div className="event-card">
      <div className="flex justify-between">
        <h3 className="font-semibold text-lg">{event.title}</h3>
        <Badge className={getCategoryColor(event.category)}>
          {getCategoryName(event.category)}
        </Badge>
      </div>
      
      <p className="text-gray-600 mt-2 line-clamp-2">{event.description}</p>
      
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar size={16} className="mr-2" />
          <span>{formattedDate} в {formattedTime} ({timeAgo})</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <MapPin size={16} className="mr-2" />
          <span>{event.location}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Clock size={16} className="mr-2" />
          <span>{event.hours} часов</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Users size={16} className="mr-2" />
          <span>{event.currentParticipants} из {event.maxParticipants} участников</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500">Организатор: {event.organizer}</span>
        
        <div className="flex space-x-2">
          <Link to={`/events/${event.id}`}>
            <Button variant="outline" size="sm">Подробнее</Button>
          </Link>
          
          {!isRegistered && !isCompletedOrPast && !hasStarted && (
            <Button 
              size="sm" 
              disabled={event.currentParticipants >= event.maxParticipants || loading}
              onClick={handleRegister}
            >
              Участвовать
            </Button>
          )}
          
          {isRegistered && (participationStatus === ParticipationStatus.REGISTERED || 
                            participationStatus === ParticipationStatus.CONFIRMED) && 
                            !isCompletedOrPast && (
            <Button 
              variant="destructive" 
              size="sm"
              disabled={loading}
              onClick={handleCancel}
            >
              Отменить
            </Button>
          )}
          
          {isRegistered && participationStatus === ParticipationStatus.ATTENDED && (
            <Badge variant="default" className="bg-volunteer-purple">
              Участвовали
            </Badge>
          )}
          
          {isCompletedOrPast && !isRegistered && (
            <Badge variant="secondary">
              Завершено
            </Badge>
          )}

          {hasStarted && !isRegistered && (
            <Badge variant="secondary">
              Уже началось
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
