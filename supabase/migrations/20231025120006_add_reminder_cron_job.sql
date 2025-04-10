
-- Установим расширение pg_cron, если оно еще не установлено
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Планируем запуск функции отправки напоминаний каждый день в 09:00
SELECT cron.schedule(
  'send-event-reminders-daily',
  '0 9 * * *',
  $$
    SELECT send_event_reminders();
  $$
);
