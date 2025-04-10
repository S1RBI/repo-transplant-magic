
import { Event, EventParticipation, ParticipationStatus, Volunteer } from "@/types";
import EventCard from "@/components/EventCard";

interface EventListProps {
  events: Event[];
  userParticipations: EventParticipation[];
  currentUser: Volunteer | null;
  loading: boolean;
  isRegistered: (eventId: string) => boolean;
  getParticipationStatus: (eventId: string) => ParticipationStatus | undefined;
  onActionComplete: () => void;
  emptyMessage?: string;
}

const EventList = ({
  events,
  userParticipations,
  currentUser,
  loading,
  isRegistered,
  getParticipationStatus,
  onActionComplete,
  emptyMessage = "Мероприятий не найдено"
}: EventListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Загрузка данных...</p>
      </div>
    );
  }
  
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">Мероприятия не найдены</h3>
        <p className="text-gray-600 mb-4">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isRegistered={isRegistered(event.id)}
          participationStatus={getParticipationStatus(event.id)}
          volunteerId={currentUser?.id || ""}
          onActionComplete={onActionComplete}
        />
      ))}
    </div>
  );
};

export default EventList;
