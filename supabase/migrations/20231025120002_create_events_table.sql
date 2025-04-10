
-- Функция для создания таблицы events
CREATE OR REPLACE FUNCTION create_events_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Создание ENUM типов для категорий и статуса мероприятий
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_category') THEN
    CREATE TYPE event_category AS ENUM ('environment', 'education', 'health', 'community', 'animal', 'other');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
    CREATE TYPE event_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
  END IF;

  -- Создание таблицы events
  CREATE TABLE IF NOT EXISTS events (
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

  -- Настройка RLS (Row Level Security)
  ALTER TABLE events ENABLE ROW LEVEL SECURITY;

  -- Добавляем политики доступа
  CREATE POLICY "Events are viewable by everyone"
    ON events FOR SELECT
    USING (true);

  CREATE POLICY "Organizers can insert events"
    ON events FOR INSERT
    WITH CHECK (auth.uid() = organizerId);

  CREATE POLICY "Organizers can update own events"
    ON events FOR UPDATE
    USING (auth.uid() = organizerId);

  CREATE POLICY "Organizers can delete own events"
    ON events FOR DELETE
    USING (auth.uid() = organizerId);
END;
$$;
