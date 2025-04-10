
# Source Code Documentation

This document provides a comprehensive overview of the server and client components of our volunteer management system.

## Server-Side Implementation

The server-side functionality is implemented using Supabase, a Backend-as-a-Service platform that provides database, authentication, and serverless functions. Instead of a traditional server with controllers and routes, our application uses Supabase's features.

### Database Schema and Migrations

#### Volunteers Table
```sql
CREATE TABLE volunteers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  skills TEXT[] DEFAULT '{}',
  joinedDate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  totalHours INTEGER DEFAULT 0,
  eventsAttended INTEGER DEFAULT 0,
  avatar TEXT
);
```

#### Organizers Table
```sql
CREATE TABLE organizers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  organization TEXT NOT NULL,
  logo TEXT
);
```

#### Events Table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  startDate TIMESTAMP WITH TIME ZONE NOT NULL,
  endDate TIMESTAMP WITH TIME ZONE NOT NULL,
  maxParticipants INTEGER NOT NULL,
  currentParticipants INTEGER DEFAULT 0,
  organizerId UUID REFERENCES organizers(id),
  organizer TEXT,
  organizerLogo TEXT,
  category event_category NOT NULL,
  status event_status DEFAULT 'upcoming',
  hours INTEGER NOT NULL
);
```

#### Participations Table
```sql
CREATE TABLE participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eventId UUID REFERENCES events(id) ON DELETE CASCADE,
  volunteerId UUID REFERENCES volunteers(id),
  status participation_status DEFAULT 'registered',
  hoursLogged INTEGER DEFAULT 0,
  feedback TEXT
);
```

#### Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  type notification_type NOT NULL,
  relatedId UUID,
  userId UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
```

### Automatic Database Functions

#### Update Completed Events
```sql
CREATE OR REPLACE FUNCTION update_completed_events()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  event_record RECORD;
  participation_record RECORD;
BEGIN
  -- Find events that have ended but are still marked as upcoming or ongoing
  FOR event_record IN 
    SELECT id, hours FROM events 
    WHERE status IN ('upcoming', 'ongoing') 
    AND enddate < NOW()
  LOOP
    -- Update event status to completed
    UPDATE events 
    SET status = 'completed' 
    WHERE id = event_record.id;
    
    -- Process confirmed participants
    FOR participation_record IN
      SELECT id, volunteerid FROM participations
      WHERE eventid = event_record.id
      AND status = 'confirmed'
    LOOP
      -- Update participation status to attended
      UPDATE participations
      SET status = 'attended',
          hourslogged = event_record.hours
      WHERE id = participation_record.id;
      
      -- Update volunteer statistics
      UPDATE volunteers
      SET totalhours = totalhours + event_record.hours,
          eventsattended = eventsattended + 1
      WHERE id = participation_record.volunteerid;
    END LOOP;
  END LOOP;
END;
$$;
```

#### Auto-Confirm Participants
```sql
CREATE OR REPLACE FUNCTION auto_confirm_participants()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update status to 'confirmed' for registered participants where the event has started
  UPDATE participations
  SET status = 'confirmed'
  WHERE status = 'registered'
  AND EXISTS (
    SELECT 1 FROM events
    WHERE events.id = participations.eventid
    AND events.startdate <= NOW()
    AND events.enddate > NOW()
  );

  -- Update event status to 'ongoing' for events that have started but not ended
  UPDATE events
  SET status = 'ongoing'
  WHERE status = 'upcoming'
  AND startdate <= NOW()
  AND enddate > NOW();
END;
$$;
```

#### Send Event Reminders
```sql
CREATE OR REPLACE FUNCTION send_event_reminders()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO notifications (title, message, type, relatedId, userId, read)
  SELECT 
    'Напоминание о мероприятии', 
    'Завтра состоится мероприятие "' || e.title || '". Не забудьте подготовиться!',
    'event'::notification_type,
    e.id,
    p.volunteerid::TEXT,
    FALSE
  FROM events e
  JOIN participations p ON e.id = p.eventid
  WHERE e.startdate BETWEEN NOW() + INTERVAL '1 day' AND NOW() + INTERVAL '1 day 1 hour'
    AND p.status IN ('registered', 'confirmed');
END;
$$;
```

### Scheduled Tasks

```sql
-- Hourly update of completed events
SELECT cron.schedule(
  'update-completed-events-hourly',
  '0 * * * *',
  'SELECT update_completed_events();'
);

-- Daily event reminders
SELECT cron.schedule(
  'daily-event-reminders',
  '0 8 * * *',
  'SELECT send_event_reminders();'
);

-- Auto-confirm participants every 15 minutes
SELECT cron.schedule(
  'auto-confirm-participants',
  '*/15 * * * *',
  'SELECT auto_confirm_participants();'
);
```

### Row-Level Security Policies

Security policies are applied to restrict data access:

```sql
-- Volunteers table policies
CREATE POLICY "Volunteers are viewable by everyone" ON volunteers FOR SELECT USING (true);
CREATE POLICY "Users can update own volunteer profile" ON volunteers FOR UPDATE USING (auth.uid() = id);

-- Events table policies
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Organizers can insert events" ON events FOR INSERT WITH CHECK (auth.uid() = organizerId);
CREATE POLICY "Organizers can update own events" ON events FOR UPDATE USING (auth.uid() = organizerId);
CREATE POLICY "Organizers can delete own events" ON events FOR DELETE USING (auth.uid() = organizerId);

-- Participations table policies
CREATE POLICY "Participations are viewable by everyone" ON participations FOR SELECT USING (true);
CREATE POLICY "Volunteers can register for events" ON participations FOR INSERT WITH CHECK (auth.uid() = volunteerId);
CREATE POLICY "Volunteers can update own participations" ON participations FOR UPDATE USING (auth.uid() = volunteerId);
```

## Client-Side Implementation

### Supabase Client Configuration (src/integrations/supabase/client.ts)

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qrbrrqrtfoltgrcwramh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYnJycXJ0Zm9sdGdyY3dyYW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDI5NTIsImV4cCI6MjA1ODk3ODk1Mn0.-eWHDRe0U-CkwP0E2Xs9MlC1QEgazA-OFqF9eylDMTY";

const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, options);
```

### Data Services Implementation

Each data service follows a similar pattern, providing CRUD operations for entities:

#### Event Service (src/lib/api/eventService.ts)

```typescript
import { supabase } from './supabaseClient';
import { Event, EventStatus } from '@/types';
import { mapDbEventToEvent, mapEventToDbEvent } from './dbTypes';

export const getEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*');
  
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  
  return (data as DbEvent[]).map(mapDbEventToEvent);
};

export const getEventById = async (id: string): Promise<Event | undefined> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching event:', error);
    return undefined;
  }
  
  return mapDbEventToEvent(data as DbEvent);
};

// Additional CRUD operations...
```

#### Volunteer Service (src/lib/api/volunteerService.ts)

```typescript
import { supabase } from './supabaseClient';
import { Volunteer } from '@/types';
import { mapDbVolunteerToVolunteer } from './dbTypes';

export const getVolunteers = async (): Promise<Volunteer[]> => {
  const { data, error } = await supabase
    .from('volunteers')
    .select('*');
  
  if (error) {
    console.error('Error fetching volunteers:', error);
    return [];
  }
  
  return (data as DbVolunteer[]).map(mapDbVolunteerToVolunteer);
};

export const getCurrentUser = async (): Promise<Volunteer> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('volunteers')
    .select('*')
    .eq('id', user.id)
    .single();
  
  // More implementation...
};

// Additional CRUD operations...
```

### UI Components Implementation

#### Event Card (src/components/EventCard.tsx)

```typescript
import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, Users, Tag } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { Event, ParticipationStatus } from "@/types";
import { registerForEvent, cancelRegistration } from "@/lib/dataService";
import { formatDate } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  isRegistered: boolean;
  participationStatus?: ParticipationStatus;
  volunteerId: string;
  onActionComplete: () => void;
}

const EventCard = ({ event, isRegistered, participationStatus, volunteerId, onActionComplete }: EventCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Component implementation...
};

export default EventCard;
```

#### Auth Context (src/contexts/AuthContext.tsx)

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Context implementation...
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### Routing and Main Application (src/App.tsx)

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import StatsPage from './pages/StatsPage';
import CalendarPage from './pages/CalendarPage';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
            <Route path="/events/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
            <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
```

## CRUD Operations Implementation

The application implements CRUD operations for all main entities:

### Create Operations
- Creating events through EventForm
- Registering for events with registerForEvent
- Creating user profiles during signup

### Read Operations
- Fetching events with getEvents, getEventById
- Retrieving user data with getCurrentUser
- Getting participation data with getParticipationsByEventId

### Update Operations
- Updating event details with updateEvent
- Changing participation status with confirmParticipation, markAttended
- Updating user profiles

### Delete Operations
- Cancelling participation with cancelRegistration
- Deleting events with deleteEvent

## Authentication Flow

1. User signs up with email/password using AuthContext.signUp
2. User signs in with email/password using AuthContext.signIn
3. Protected routes check for authentication using ProtectedRoute component
4. User signs out using AuthContext.signOut

## Data Flow

1. User interface components make calls to service layers
2. Service layers make API calls to Supabase
3. Supabase applies Row-Level Security policies
4. Data is returned to service layers
5. Service layers transform data for UI components
6. UI components render the data
