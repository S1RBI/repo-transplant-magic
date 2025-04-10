
# Документация кода проекта системы учета волонтерской активности

## Общая структура проекта

Данный проект представляет собой веб-приложение для управления волонтерской деятельностью, разработанное с использованием React, TypeScript и Supabase в качестве бэкенда. Приложение позволяет волонтерам регистрироваться на мероприятия, отслеживать свои часы, а организаторам управлять мероприятиями и участниками.

## Архитектура приложения

Приложение построено по принципу клиент-серверной архитектуры:

1. **Клиентская часть** - React-приложение
2. **Серверная часть** - Supabase (BaaS) предоставляющий базу данных PostgreSQL, аутентификацию и хранилище

## Структура базы данных

### Основные таблицы

1. **volunteers (Волонтеры)**
   - `id`: UUID (первичный ключ)
   - `name`: имя волонтера
   - `email`: электронная почта
   - `phone`: телефон (опционально)
   - `skills`: массив навыков
   - `joinedDate`: дата регистрации
   - `totalHours`: общее количество отработанных часов
   - `eventsAttended`: количество посещенных мероприятий
   - `avatar`: URL аватара (опционально)

2. **organizers (Организаторы)**
   - `id`: UUID (первичный ключ)
   - `name`: имя организатора
   - `email`: электронная почта
   - `phone`: телефон (опционально)
   - `organization`: название организации
   - `logo`: URL логотипа (опционально)

3. **events (Мероприятия)**
   - `id`: UUID (первичный ключ)
   - `title`: название мероприятия
   - `description`: описание
   - `location`: место проведения
   - `startDate`: дата и время начала
   - `endDate`: дата и время окончания
   - `maxParticipants`: максимальное количество участников
   - `currentParticipants`: текущее количество участников
   - `organizerId`: UUID организатора (внешний ключ)
   - `organizer`: название организатора
   - `organizerLogo`: URL логотипа организатора
   - `category`: категория мероприятия (environment, education, health, community, animal, other)
   - `status`: статус мероприятия (upcoming, ongoing, completed, cancelled)
   - `hours`: количество волонтерских часов

4. **participations (Участие в мероприятиях)**
   - `id`: UUID (первичный ключ)
   - `eventId`: UUID мероприятия (внешний ключ)
   - `volunteerId`: UUID волонтера (внешний ключ)
   - `status`: статус участия (registered, confirmed, attended, cancelled, no_show)
   - `hoursLogged`: зачтенные часы
   - `feedback`: отзыв (опционально)

5. **notifications (Уведомления)**
   - `id`: UUID (первичный ключ)
   - `title`: заголовок уведомления
   - `message`: текст уведомления
   - `date`: дата создания
   - `read`: статус прочтения
   - `type`: тип уведомления (event, system, message)
   - `relatedId`: связанный идентификатор
   - `userId`: идентификатор пользователя

### Автоматические функции базы данных

1. **update_completed_events()** - Функция обновления статуса завершенных мероприятий
   - Автоматически меняет статус мероприятия на "completed" после окончания времени проведения
   - Обновляет статус участия и учитывает часы волонтеров

2. **auto_confirm_participants()** - Функция автоматического подтверждения участников
   - Меняет статус участия с "registered" на "confirmed", когда мероприятие начинается
   - Меняет статус мероприятия с "upcoming" на "ongoing", когда мероприятие начинается

3. **send_event_reminders()** - Функция для отправки напоминаний о предстоящих мероприятиях
   - Создает уведомления за день до начала мероприятия

## Политики безопасности (Row Level Security)

В базе данных настроены политики безопасности на уровне строк (RLS), которые обеспечивают:
- Волонтеры могут просматривать только свои собственные данные
- Волонтеры могут регистрироваться на мероприятия и обновлять свои регистрации
- Организаторы могут создавать, обновлять и удалять только свои мероприятия
- Организаторы могут управлять участниками своих мероприятий

## Основные компоненты клиентской части

### Аутентификация

Реализована в `src/contexts/AuthContext.tsx`. Компонент предоставляет:
- Контекст аутентификации для всего приложения
- Функции для входа, регистрации и выхода из системы
- Отслеживание текущего пользователя и его профиля

```typescript
// Основной контекст аутентификации
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер контекста аутентификации
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Состояние для хранения данных аутентификации
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);

  // Эффект для отслеживания изменений в аутентификации
  useEffect(() => {
    // Здесь устанавливается слушатель для изменений состояния аутентификации
    // и загружается профиль волонтера при входе в систему
  }, []);

  // Функции для входа, регистрации и выхода
  const handleSignIn = async (email: string, password: string) => {
    // Реализация входа
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    // Реализация регистрации
  };

  const handleSignOut = async () => {
    // Реализация выхода
  };

  // Предоставление контекста для дочерних компонентов
  return <AuthContext.Provider value={...}>{children}</AuthContext.Provider>;
};

// Хук для использования контекста аутентификации
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### Сервисы данных

Реализованы в директории `src/lib/api/`. Основные сервисы:

1. **volunteerService.ts** - Управление данными волонтеров
   - Получение списка волонтеров
   - Получение данных о конкретном волонтере
   - Создание и обновление профиля волонтера

2. **eventService.ts** - Управление мероприятиями
   - Получение списка мероприятий
   - Получение данных о конкретном мероприятии
   - Создание, обновление и удаление мероприятий
   - Фильтрация мероприятий по статусу

3. **participationService.ts** - Управление участием в мероприятиях
   - Регистрация на мероприятие
   - Отмена регистрации
   - Подтверждение участия
   - Отметка о посещении и учет часов

4. **notificationService.ts** - Управление уведомлениями
   - Получение уведомлений пользователя
   - Отметка уведомлений как прочитанных
   - Создание новых уведомлений

### Пример сервиса для работы с мероприятиями:

```typescript
// Получение всех мероприятий
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

// Создание нового мероприятия
export const createEvent = async (eventData: Omit<Event, 'id'>): Promise<Event> => {
  const dbEventData = mapEventToDbEvent(eventData);
  
  const insertData = {
    // Преобразование полей для базы данных
  };
  
  const { data, error } = await supabase
    .from('events')
    .insert(insertData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event');
  }
  
  return mapDbEventToEvent(data as DbEvent);
};
```

### Страницы приложения

1. **AuthPage.tsx** - Страница аутентификации
   - Формы входа и регистрации
   - Валидация данных пользователя

2. **Index.tsx** - Главная страница
   - Отображение статистики волонтера
   - Список предстоящих мероприятий
   - Информационные карточки

3. **EventsPage.tsx** - Страница со списком мероприятий
   - Фильтрация мероприятий
   - Отображение списка мероприятий в виде карточек

4. **EventDetailPage.tsx** - Страница с подробной информацией о мероприятии
   - Информация о мероприятии
   - Список участников
   - Кнопки для регистрации/отмены регистрации

5. **StatsPage.tsx** - Страница статистики
   - Графики и диаграммы волонтерской активности
   - Рейтинг волонтеров

6. **CalendarPage.tsx** - Календарь мероприятий
   - Календарное представление мероприятий

### Компоненты пользовательского интерфейса

1. **EventCard.tsx** - Карточка мероприятия
   - Отображение основной информации о мероприятии
   - Кнопки для действий (регистрация, отмена)

```typescript
// Пример компонента карточки мероприятия
const EventCard = ({ 
  event, 
  isRegistered, 
  participationStatus, 
  volunteerId, 
  onActionComplete 
}: EventCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Обработчик регистрации на мероприятие
  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await registerForEvent(event.id, volunteerId);
      onActionComplete();
    } catch (error) {
      console.error('Error registering for event:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Отображение карточки мероприятия
  return (
    <div className="card">
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      {/* Отображение кнопок действий в зависимости от статуса */}
    </div>
  );
};
```

2. **EventForm.tsx** - Форма создания/редактирования мероприятия
   - Поля для ввода данных о мероприятии
   - Валидация данных

3. **Header.tsx** - Шапка приложения
   - Навигационное меню
   - Иконка уведомлений

4. **NotificationDropdown.tsx** - Выпадающий список уведомлений
   - Отображение списка уведомлений
   - Отметка уведомлений как прочитанных

5. **ProtectedRoute.tsx** - Компонент для защиты маршрутов
   - Перенаправление неаутентифицированных пользователей

## Автоматизированные процессы

### Обновление статуса мероприятий

Процесс запускается по расписанию каждый час через cron-задачу:

```sql
-- Запуск обновления статуса мероприятий каждый час
SELECT cron.schedule(
  'update-completed-events-hourly',
  '0 * * * *',
  'SELECT update_completed_events();'
);
```

### Автоматическое подтверждение участников

Процесс запускается каждые 15 минут и автоматически меняет статус участников с "registered" на "confirmed", когда мероприятие начинается:

```sql
-- Запуск автоматического подтверждения участников каждые 15 минут
SELECT cron.schedule(
  'auto-confirm-participants',
  '*/15 * * * *',
  'SELECT auto_confirm_participants();'
);
```

### Отправка напоминаний о мероприятиях

Процесс запускается ежедневно в 8:00 и отправляет напоминания о мероприятиях, которые начнутся завтра:

```sql
-- Запуск отправки напоминаний каждый день в 8:00
SELECT cron.schedule(
  'daily-event-reminders',
  '0 8 * * *',
  'SELECT send_event_reminders();'
);
```

## Маршрутизация и основное приложение

Маршрутизация реализована в `src/App.tsx` с использованием React Router:

```typescript
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
```

## Типы данных

Определены в `src/types/index.ts`:

```typescript
// Пример типов данных
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
```

## Процесс разработки

Для работы с проектом необходимо:

1. Клонировать репозиторий
2. Установить зависимости
3. Настроить переменные окружения для доступа к Supabase
4. Запустить приложение в режиме разработки

## Технологический стек

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **State Management**: React Query
- **Маршрутизация**: React Router
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Формы и валидация**: React Hook Form, Zod
- **Визуализация данных**: Recharts

## Ключевые особенности приложения

1. **Реактивность данных**: данные обновляются в реальном времени благодаря React Query
2. **Разделение прав доступа**: волонтеры и организаторы имеют разные права и возможности
3. **Автоматизация процессов**: автоматическое обновление статусов, отправка уведомлений
4. **Защита данных**: политики безопасности на уровне базы данных
5. **Аналитика и статистика**: визуальное представление данных о волонтерской активности

## Заключение

Данный проект представляет собой полноценное веб-приложение для управления волонтерской деятельностью с реализацией полного стека технологий: от пользовательского интерфейса до базы данных и автоматизированных процессов. Использование Supabase в качестве бэкенда позволяет сосредоточиться на разработке функциональности без необходимости создания отдельного серверного приложения.
