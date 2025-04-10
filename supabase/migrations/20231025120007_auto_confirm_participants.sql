
-- Create a function to automatically confirm participants when an event starts
CREATE OR REPLACE FUNCTION auto_confirm_participants()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update status to 'confirmed' for registered participants where the event has started
  UPDATE participations
  SET status = 'confirmed'
  WHERE status = 'registered'
  AND EXISTS (
    SELECT 1 FROM events
    WHERE events.id = participations.eventid
    AND events.startdate <= NOW()
    AND events.enddate > NOW()
  );

  -- Update event status to 'ongoing' for events that have started but not ended
  UPDATE events
  SET status = 'ongoing'
  WHERE status = 'upcoming'
  AND startdate <= NOW()
  AND enddate > NOW();
END;
$$;

-- Create a cron job to run this function every 15 minutes
SELECT cron.schedule(
  'auto-confirm-participants',
  '*/15 * * * *',  -- Run every 15 minutes
  'SELECT auto_confirm_participants();'
);

-- Execute the function immediately
SELECT auto_confirm_participants();
