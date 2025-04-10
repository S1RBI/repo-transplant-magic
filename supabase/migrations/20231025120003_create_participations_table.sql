
-- Функция для создания таблицы participations
CREATE OR REPLACE FUNCTION create_participations_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Создание ENUM типа для статуса участия
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'participation_status') THEN
    CREATE TYPE participation_status AS ENUM ('registered', 'confirmed', 'attended', 'cancelled', 'no_show');
  END IF;

  -- Создание таблицы participations
  CREATE TABLE IF NOT EXISTS participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eventId UUID REFERENCES events(id) ON DELETE CASCADE,
    volunteerId UUID REFERENCES volunteers(id),
    status participation_status DEFAULT 'registered',
    hoursLogged INTEGER DEFAULT 0,
    feedback TEXT
  );

  -- Настройка RLS (Row Level Security)
  ALTER TABLE participations ENABLE ROW LEVEL SECURITY;

  -- Добавляем политики доступа
  CREATE POLICY "Participations are viewable by everyone"
    ON participations FOR SELECT
    USING (true);

  CREATE POLICY "Volunteers can register for events"
    ON participations FOR INSERT
    WITH CHECK (auth.uid() = volunteerId);

  CREATE POLICY "Volunteers can update own participations"
    ON participations FOR UPDATE
    USING (auth.uid() = volunteerId);

  CREATE POLICY "Organizers can update participations for their events"
    ON participations FOR UPDATE
    USING (EXISTS (
      SELECT 1 FROM events
      WHERE events.id = participations.eventId
      AND events.organizerId = auth.uid()
    ));
END;
$$;
