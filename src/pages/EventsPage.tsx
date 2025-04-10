import { useState, useEffect } from "react";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { EventCategory, Event, EventParticipation, ParticipationStatus, Volunteer } from "@/types";
import { 
  getEvents, 
  getCurrentUser, 
  getParticipationsByVolunteerId,
  getUpcomingEvents,
  getCompletedEvents
} from "@/lib/dataService";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EventForm from "@/components/EventForm";

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [currentUser, setCurrentUser] = useState<Volunteer | null>(null);
  const [userParticipations, setUserParticipations] = useState<EventParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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
      
      applyFilters(eventsData, searchQuery, categoryFilter);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const applyFilters = (
    eventsToFilter: Event[], 
    query: string, 
    category: string
  ) => {
    let result = [...eventsToFilter];
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(
        event => 
          event.title.toLowerCase().includes(lowerQuery) || 
          event.description.toLowerCase().includes(lowerQuery) ||
          event.location.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (category && category !== "all") {
      result = result.filter(event => event.category === category);
    }
    
    setFilteredEvents(result);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(events, query, categoryFilter);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    applyFilters(events, searchQuery, value);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

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
          
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Поиск мероприятий..."
                className="pl-10"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            
            <div className="w-full md:w-64">
              <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value={EventCategory.ENVIRONMENT}>Экология</SelectItem>
                  <SelectItem value={EventCategory.EDUCATION}>Образование</SelectItem>
                  <SelectItem value={EventCategory.HEALTH}>Здоровье</SelectItem>
                  <SelectItem value={EventCategory.COMMUNITY}>Сообщество</SelectItem>
                  <SelectItem value={EventCategory.ANIMAL}>Животные</SelectItem>
                  <SelectItem value={EventCategory.OTHER}>Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="all" className="mt-6">
            <EventListContent 
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
            <EventListContent 
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
            <EventListContent 
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
            <EventListContent 
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

interface EventListContentProps {
  events: Event[];
  userParticipations: EventParticipation[];
  currentUser: Volunteer | null;
  loading: boolean;
  isRegistered: (eventId: string) => boolean;
  getParticipationStatus: (eventId: string) => ParticipationStatus | undefined;
  onActionComplete: () => void;
  emptyMessage?: string;
}

const EventListContent = ({
  events,
  userParticipations,
  currentUser,
  loading,
  isRegistered,
  getParticipationStatus,
  onActionComplete,
  emptyMessage = "Мероприятий не найдено"
}: EventListContentProps) => {
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

export default EventsPage;
