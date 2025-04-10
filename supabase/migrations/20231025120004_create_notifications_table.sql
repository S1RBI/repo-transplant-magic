
-- Функция для создания таблицы notifications
CREATE OR REPLACE FUNCTION create_notifications_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Создание ENUM типа для типов уведомлений
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM ('event', 'system', 'message');
  END IF;

  -- Создание таблицы notifications
  CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE,
    type notification_type NOT NULL,
    relatedId UUID,
    userId UUID REFERENCES auth.users(id) ON DELETE CASCADE
  );

  -- Настройка RLS (Row Level Security)
  ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

  -- Добавляем политики доступа
  CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = userId);

  CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = userId);

  -- Триггер для создания уведомления при создании нового мероприятия
  -- Создаем функцию триггера отдельно, после создания всех таблиц
END;
$$;

-- Создание функции триггера для уведомлений о новых мероприятиях
-- Ее нужно создавать после того, как все таблицы уже созданы
CREATE OR REPLACE FUNCTION create_event_notification_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (title, message, type, relatedId, userId)
  SELECT 
    'Новое мероприятие', 
    'Появилось новое мероприятие "' || NEW.title || '", которое может вас заинтересовать',
    'event'::notification_type,
    NEW.id,
    id
  FROM volunteers;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем функцию для добавления триггера после создания всех таблиц
CREATE OR REPLACE FUNCTION add_event_notification_trigger()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Удаляем триггер, если он существует
  DROP TRIGGER IF EXISTS event_notification_trigger ON events;
  
  -- Создаем триггер для новых мероприятий
  CREATE TRIGGER event_notification_trigger
    AFTER INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION create_event_notification_function();
END;
$$;
