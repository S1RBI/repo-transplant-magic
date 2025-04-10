
-- Функция для создания таблицы organizers
CREATE OR REPLACE FUNCTION create_organizers_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Создание таблицы organizers
  CREATE TABLE IF NOT EXISTS organizers (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    organization TEXT NOT NULL,
    logo TEXT
  );

  -- Настройка RLS (Row Level Security)
  ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;

  -- Добавляем политики доступа
  CREATE POLICY "Organizers are viewable by everyone"
    ON organizers FOR SELECT
    USING (true);

  CREATE POLICY "Users can update own organizer profile"
    ON organizers FOR UPDATE
    USING (auth.uid() = id);
END;
$$;
