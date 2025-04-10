
-- Функция для создания таблицы volunteers
CREATE OR REPLACE FUNCTION create_volunteers_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Создание ENUM типа для навыков
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_type') THEN
    CREATE TYPE skill_type AS ENUM ('environment', 'education', 'health', 'community', 'animal', 'other');
  END IF;

  -- Создание таблицы volunteers
  CREATE TABLE IF NOT EXISTS volunteers (
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

  -- Настройка RLS (Row Level Security)
  ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

  -- Добавляем политики доступа
  CREATE POLICY "Volunteers are viewable by everyone"
    ON volunteers FOR SELECT
    USING (true);

  CREATE POLICY "Users can update own volunteer profile"
    ON volunteers FOR UPDATE
    USING (auth.uid() = id);
END;
$$;
