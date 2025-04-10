
// Re-export all services
export * from './supabaseClient';
export * from './dbTypes';
export * from './volunteerService';
export * from './organizerService';
export * from './eventService';
export * from './participationService';
export * from './notificationService';
export * from './statsService';

// Export the old sendEmailNotification function for compatibility
import { sendEmailNotification } from '@/integrations/supabase/client';
export { sendEmailNotification };
