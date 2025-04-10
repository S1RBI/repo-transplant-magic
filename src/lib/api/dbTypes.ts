
import { 
  Volunteer, 
  Organizer, 
  Event, 
  EventParticipation, 
  EventCategory, 
  ParticipationStatus,
  EventStatus,
} from '@/types';

// Type definitions for database models
export type DbVolunteer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  joineddate: string;
  totalhours: number;
  eventsattended: number;
  avatar?: string;
};

export type DbEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  startdate: string;
  enddate: string;
  maxparticipants: number;
  currentparticipants: number;
  organizerid: string;
  organizer?: string;
  organizerlogo?: string;
  category: string; // Storing as string in DB
  status: string; // Storing as string in DB
  hours: number;
};

export type DbParticipation = {
  id: string;
  eventid: string;
  volunteerid: string;
  status: string; // Storing as string in DB
  hourslogged: number;
  feedback?: string;
};

// Mapping functions between DB models and app models
export const mapDbVolunteerToVolunteer = (dbVolunteer: DbVolunteer): Volunteer => ({
  id: dbVolunteer.id,
  name: dbVolunteer.name,
  email: dbVolunteer.email,
  phone: dbVolunteer.phone,
  skills: dbVolunteer.skills,
  joinedDate: dbVolunteer.joineddate,
  totalHours: dbVolunteer.totalhours,
  eventsAttended: dbVolunteer.eventsattended,
  avatar: dbVolunteer.avatar
});

export const mapVolunteerToDbVolunteer = (volunteer: Partial<Volunteer>): Record<string, any> => {
  // Create an object with only the properties that are defined
  const result: Record<string, any> = {};
  
  if (volunteer.id !== undefined) result.id = volunteer.id;
  if (volunteer.name !== undefined) result.name = volunteer.name;
  if (volunteer.email !== undefined) result.email = volunteer.email;
  if (volunteer.phone !== undefined) result.phone = volunteer.phone;
  if (volunteer.skills !== undefined) result.skills = volunteer.skills;
  if (volunteer.joinedDate !== undefined) result.joineddate = volunteer.joinedDate;
  if (volunteer.totalHours !== undefined) result.totalhours = volunteer.totalHours;
  if (volunteer.eventsAttended !== undefined) result.eventsattended = volunteer.eventsAttended;
  if (volunteer.avatar !== undefined) result.avatar = volunteer.avatar;
  
  return result;
};

export const mapDbEventToEvent = (dbEvent: DbEvent): Event => ({
  id: dbEvent.id,
  title: dbEvent.title,
  description: dbEvent.description,
  location: dbEvent.location,
  startDate: dbEvent.startdate,
  endDate: dbEvent.enddate,
  maxParticipants: dbEvent.maxparticipants,
  currentParticipants: dbEvent.currentparticipants,
  organizerId: dbEvent.organizerid,
  organizer: dbEvent.organizer,
  organizerLogo: dbEvent.organizerlogo,
  category: dbEvent.category as EventCategory,
  status: dbEvent.status as EventStatus,
  hours: dbEvent.hours
});

export const mapEventToDbEvent = (event: Partial<Event>): Record<string, any> => {
  // Create an object with only the properties that are defined
  const result: Record<string, any> = {};
  
  if (event.id !== undefined) result.id = event.id;
  if (event.title !== undefined) result.title = event.title;
  if (event.description !== undefined) result.description = event.description;
  if (event.location !== undefined) result.location = event.location;
  if (event.startDate !== undefined) result.startdate = event.startDate;
  if (event.endDate !== undefined) result.enddate = event.endDate;
  if (event.maxParticipants !== undefined) result.maxparticipants = event.maxParticipants;
  if (event.currentParticipants !== undefined) result.currentparticipants = event.currentParticipants;
  if (event.organizerId !== undefined) result.organizerid = event.organizerId;
  if (event.organizer !== undefined) result.organizer = event.organizer;
  if (event.organizerLogo !== undefined) result.organizerlogo = event.organizerLogo;
  if (event.category !== undefined) result.category = event.category;
  if (event.status !== undefined) result.status = event.status;
  if (event.hours !== undefined) result.hours = event.hours;
  
  return result;
};

export const mapDbParticipationToParticipation = (dbParticipation: DbParticipation): EventParticipation => ({
  id: dbParticipation.id,
  eventId: dbParticipation.eventid,
  volunteerId: dbParticipation.volunteerid,
  status: dbParticipation.status as ParticipationStatus,
  hoursLogged: dbParticipation.hourslogged,
  feedback: dbParticipation.feedback
});

export const mapParticipationToDbParticipation = (participation: Partial<EventParticipation>): Record<string, any> => {
  // Create an object with only the properties that are defined
  const result: Record<string, any> = {};
  
  if (participation.id !== undefined) result.id = participation.id;
  if (participation.eventId !== undefined) result.eventid = participation.eventId;
  if (participation.volunteerId !== undefined) result.volunteerid = participation.volunteerId;
  if (participation.status !== undefined) result.status = participation.status;
  if (participation.hoursLogged !== undefined) result.hourslogged = participation.hoursLogged;
  if (participation.feedback !== undefined) result.feedback = participation.feedback;
  
  return result;
};
