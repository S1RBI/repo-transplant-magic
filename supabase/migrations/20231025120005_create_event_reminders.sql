
-- Функция для отправки напоминаний о мероприятиях
CREATE OR REPLACE FUNCTION public.send_event_reminders()
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
    p.volunteerid::TEXT, -- Преобразуем UUID в TEXT
    FALSE
  FROM events e
  JOIN participations p ON e.id = p.eventid
  WHERE e.startdate BETWEEN NOW() + INTERVAL '1 day' AND NOW() + INTERVAL '1 day 1 hour'
    AND p.status IN ('registered', 'confirmed');
END;
$$;
