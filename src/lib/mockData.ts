
import { 
  Volunteer, 
  Organizer, 
  Event, 
  EventParticipation, 
  EventCategory, 
  EventStatus,
  ParticipationStatus 
} from '@/types';

// Mock Volunteers
export const volunteers: Volunteer[] = [
  {
    id: '1',
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    phone: '+7 (999) 123-4567',
    skills: ['Преподавание', 'Уборка', 'Организация мероприятий'],
    joinedDate: '2023-01-15',
    totalHours: 45,
    eventsAttended: 8
  },
  {
    id: '2',
    name: 'Анна Смирнова',
    email: 'anna@example.com',
    phone: '+7 (999) 765-4321',
    skills: ['Медицинская помощь', 'Координация', 'Социальная работа'],
    joinedDate: '2023-02-20',
    totalHours: 32,
    eventsAttended: 5
  },
  {
    id: '3',
    name: 'Алексей Петров',
    email: 'alexey@example.com',
    phone: '+7 (999) 111-2222',
    skills: ['IT поддержка', 'Строительство', 'Фотография'],
    joinedDate: '2023-03-10',
    totalHours: 28,
    eventsAttended: 4
  }
];

// Mock Organizers
export const organizers: Organizer[] = [
  {
    id: '1',
    name: 'Эко-инициатива',
    email: 'eco@example.com',
    phone: '+7 (999) 333-4444',
    organization: 'Экологическая организация "Зеленый мир"'
  },
  {
    id: '2',
    name: 'Образовательный центр "Знание"',
    email: 'education@example.com',
    phone: '+7 (999) 555-6666',
    organization: 'Центр дополнительного образования'
  },
  {
    id: '3',
    name: 'Фонд помощи животным "Лапки"',
    email: 'animals@example.com',
    phone: '+7 (999) 777-8888',
    organization: 'Благотворительный фонд помощи бездомным животным'
  }
];

// Get current date and related dates for mock data
const now = new Date();
const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(now);
nextWeek.setDate(nextWeek.getDate() + 7);
const twoWeeksLater = new Date(now);
twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
const lastWeek = new Date(now);
lastWeek.setDate(lastWeek.getDate() - 7);

// Mock Events
export const events: Event[] = [
  {
    id: '1',
    title: 'Уборка парка "Сосновый бор"',
    description: 'Помощь в очистке территории парка от мусора и благоустройстве зоны отдыха',
    location: 'Парк "Сосновый бор", ул. Лесная, 10',
    startDate: tomorrow.toISOString(),
    endDate: tomorrow.toISOString(),
    maxParticipants: 20,
    currentParticipants: 12,
    organizerId: '1',
    organizer: 'Эко-инициатива',
    category: EventCategory.ENVIRONMENT,
    status: EventStatus.UPCOMING,
    hours: 4
  },
  {
    id: '2',
    title: 'Мастер-класс для детей из детского дома',
    description: 'Проведение творческого мастер-класса для детей из детского дома №5',
    location: 'Детский дом №5, ул. Центральная, 25',
    startDate: nextWeek.toISOString(),
    endDate: nextWeek.toISOString(),
    maxParticipants: 15,
    currentParticipants: 8,
    organizerId: '2',
    organizer: 'Образовательный центр "Знание"',
    category: EventCategory.EDUCATION,
    status: EventStatus.UPCOMING,
    hours: 3
  },
  {
    id: '3',
    title: 'Помощь в приюте для животных',
    description: 'Работа в приюте для бездомных животных: выгул собак, уборка, кормление',
    location: 'Приют "Верный друг", ул. Привокзальная, 15',
    startDate: twoWeeksLater.toISOString(),
    endDate: twoWeeksLater.toISOString(),
    maxParticipants: 10,
    currentParticipants: 6,
    organizerId: '3',
    organizer: 'Фонд помощи животным "Лапки"',
    category: EventCategory.ANIMAL,
    status: EventStatus.UPCOMING,
    hours: 5
  },
  {
    id: '4',
    title: 'Донорство крови',
    description: 'Организованная группа для сдачи крови в центре переливания',
    location: 'Центр переливания крови, ул. Медицинская, 7',
    startDate: lastWeek.toISOString(),
    endDate: lastWeek.toISOString(),
    maxParticipants: 25,
    currentParticipants: 22,
    organizerId: '2',
    organizer: 'Образовательный центр "Знание"',
    category: EventCategory.HEALTH,
    status: EventStatus.COMPLETED,
    hours: 2
  },
];

// Mock Event Participations
export const participations: EventParticipation[] = [
  {
    id: '1',
    eventId: '1',
    volunteerId: '1',
    status: ParticipationStatus.CONFIRMED,
    hoursLogged: 0
  },
  {
    id: '2',
    eventId: '2',
    volunteerId: '1',
    status: ParticipationStatus.REGISTERED,
    hoursLogged: 0
  },
  {
    id: '3',
    eventId: '4',
    volunteerId: '1',
    status: ParticipationStatus.ATTENDED,
    hoursLogged: 2,
    feedback: 'Очень полезное мероприятие!'
  },
  {
    id: '4',
    eventId: '1',
    volunteerId: '2',
    status: ParticipationStatus.CONFIRMED,
    hoursLogged: 0
  },
  {
    id: '5',
    eventId: '4',
    volunteerId: '2',
    status: ParticipationStatus.ATTENDED,
    hoursLogged: 2,
    feedback: 'Было здорово помочь!'
  },
  {
    id: '6',
    eventId: '3',
    volunteerId: '3',
    status: ParticipationStatus.REGISTERED,
    hoursLogged: 0
  }
];

// Current logged in user (for demo purposes)
export const currentUser: Volunteer = volunteers[0];
