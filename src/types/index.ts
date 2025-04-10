
export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  joinedDate: string;
  totalHours: number;
  eventsAttended: number;
  avatar?: string;
}

export interface Organizer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization: string;
  logo?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  organizerId: string;
  organizer?: string;
  organizerLogo?: string;
  category: EventCategory;
  status: EventStatus;
  hours: number;
}

export interface EventParticipation {
  id: string;
  eventId: string;
  volunteerId: string;
  status: ParticipationStatus;
  hoursLogged: number;
  feedback?: string;
  volunteerName?: string; // Добавляем опциональное имя волонтера
}

export enum EventCategory {
  ENVIRONMENT = "environment",
  EDUCATION = "education",
  HEALTH = "health",
  COMMUNITY = "community",
  ANIMAL = "animal",
  OTHER = "other"
}

export enum EventStatus {
  UPCOMING = "upcoming",
  ONGOING = "ongoing",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export enum ParticipationStatus {
  REGISTERED = "registered",
  CONFIRMED = "confirmed",
  ATTENDED = "attended",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show"
}

export interface VolunteerStats {
  totalEvents: number;
  totalHours: number;
  categoriesParticipated: Record<EventCategory, number>;
  upcomingEvents: number;
  rank?: number;
  level?: string;
}

export type NotificationType = 'event' | 'system' | 'message';

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: NotificationType;
  relatedId?: string;
}
