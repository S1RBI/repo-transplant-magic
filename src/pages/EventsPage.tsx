
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Event, EventParticipation, ParticipationStatus, Volunteer } from "@/types";
import { 
  getEvents, 
  getCurrentUser, 
  getParticipationsByVolunteerId,
  getUpcomingEvents,
  getCompletedEvents
} from "@/lib/dataService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EventForm from "@/components/EventForm";
import EventList from "@/components/EventList";
import EventFilters from "@/components/EventFilters";
import { useEventFilters } from "@/hooks/useEventFilters";

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentUser, setCurrentUser] = useState<Volunteer | null>(null);
  const [userParticipations, setUserParticipations] = useState<EventParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const { 
    searchQuery, 
    categoryFilter, 
    filteredEvents, 
    handleSearch, 
    handleCategoryChange 
  } = useEventFilters(events, activeTab);

  const fetchData = async () => {
    setLoading(true);
    try {
      let eventsData: Event[];
      
      switch (activeTab) {
        case "upcoming":
          eventsData = await getUpcomingEvents();
          break;
        case "past":
          eventsData = await getCompletedEvents();
          break;
        case "all":
        default:
          eventsData = await getEvents();
          break;
      }
      
      setEvents(eventsData);
      
      const user = await getCurrentUser();
      setCurrentUser(user);
      
      const participations = await getParticipationsByVolunteerId(user.id);
      setUserParticipations(participations);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const isRegistered = (eventId: string) => {
    return userParticipations.some(p => p.eventId === eventId);
  };

  const getParticipationStatus = (eventId: string) => {
    const participation = userParticipations.find(p => p.eventId === eventId);
    return participation?.status;
  };

  const handleEventCreated = () => {
    setShowCreateDialog(false);
    fetchData();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-6 px-4 md:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Мероприятия</h1>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Создать мероприятие
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Создание нового мероприятия</DialogTitle>
              </DialogHeader>
              <EventForm onSuccess={handleEventCreated} />
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">Все мероприятия</TabsTrigger>
            <TabsTrigger value="upcoming">Предстоящие</TabsTrigger>
            <TabsTrigger value="past">Прошедшие</TabsTrigger>
            <TabsTrigger value="my">Мои мероприятия</TabsTrigger>
          </TabsList>
          
          <EventFilters 
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            onSearchChange={handleSearch}
            onCategoryChange={handleCategoryChange}
          />
          
          <TabsContent value="all" className="mt-6">
            <EventList 
              events={filteredEvents}
              userParticipations={userParticipations}
              currentUser={currentUser}
              loading={loading}
              isRegistered={isRegistered}
              getParticipationStatus={getParticipationStatus}
              onActionComplete={fetchData}
            />
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-6">
            <EventList 
              events={filteredEvents}
              userParticipations={userParticipations}
              currentUser={currentUser}
              loading={loading}
              isRegistered={isRegistered}
              getParticipationStatus={getParticipationStatus}
              onActionComplete={fetchData}
            />
          </TabsContent>
          
          <TabsContent value="past" className="mt-6">
            <EventList 
              events={filteredEvents}
              userParticipations={userParticipations}
              currentUser={currentUser}
              loading={loading}
              isRegistered={isRegistered}
              getParticipationStatus={getParticipationStatus}
              onActionComplete={fetchData}
            />
          </TabsContent>
          
          <TabsContent value="my" className="mt-6">
            <EventList 
              events={filteredEvents.filter(event => 
                userParticipations.some(p => p.eventId === event.id)
              )}
              userParticipations={userParticipations}
              currentUser={currentUser}
              loading={loading}
              isRegistered={isRegistered}
              getParticipationStatus={getParticipationStatus}
              onActionComplete={fetchData}
              emptyMessage="Вы еще не зарегистрировались ни на одно мероприятие"
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EventsPage;
