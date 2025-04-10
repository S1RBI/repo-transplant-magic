
import { supabase } from './supabaseClient';
import { Notification, NotificationType } from '@/types';
import { toast } from '@/components/ui/use-toast';

export const getNotifications = async (): Promise<Notification[]> => {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('userid', authData.user.id)
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  
  return data || [];
};

export const getUnreadNotificationsCount = async (): Promise<number> => {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return 0;
  }
  
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('userid', authData.user.id)
    .eq('read', false);
  
  if (error) {
    console.error('Error fetching unread notifications count:', error);
    return 0;
  }
  
  return count || 0;
};

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
  
  if (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
  
  return true;
};

export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return false;
  }
  
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('userid', authData.user.id)
    .eq('read', false);
  
  if (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
  
  return true;
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'system',
  relatedId?: string
): Promise<Notification | undefined> => {
  try {
    const notificationData = {
      userid: userId,
      title,
      message,
      type,
      relatedid: relatedId,
      date: new Date().toISOString(),
      read: false
    };
    
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
    
    // Показываем тост пользователю
    toast({
      title: title,
      description: message,
    });
    
    return data;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return undefined;
  }
};

// Функция для создания уведомления о приближающемся мероприятии
export const createEventReminderNotification = async (
  userId: string,
  eventId: string,
  eventTitle: string
): Promise<Notification | undefined> => {
  return createNotification(
    userId,
    'Напоминание о мероприятии',
    `Мероприятие "${eventTitle}" начнется завтра. Не забудьте подготовиться!`,
    'event',
    eventId
  );
};
