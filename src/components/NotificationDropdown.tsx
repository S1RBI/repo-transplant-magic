
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Notification } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/api/notificationService";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadNotifications();
    
    // Обновляем уведомления каждые 5 минут
    const interval = setInterval(() => {
      loadNotifications();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    // Обновляем локальный список уведомлений
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };
  
  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    // Обновляем локальный список уведомлений
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-volunteer-purple text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex justify-between items-center p-2">
          <DropdownMenuLabel>Уведомления</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs" 
              onClick={handleMarkAllAsRead}
            >
              Прочитать все
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="py-4 px-2 text-center">
            Загрузка уведомлений...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-4 px-2 text-center text-muted-foreground">
            У вас нет уведомлений
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="cursor-pointer flex flex-col items-start p-3">
                <div className="flex justify-between w-full">
                  <span className={`font-semibold ${!notification.read ? 'text-volunteer-purple' : ''}`}>
                    {notification.title}
                    {!notification.read && (
                      <span className="ml-2 inline-block h-2 w-2 rounded-full bg-volunteer-purple"></span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.date), { 
                      addSuffix: true, 
                      locale: ru 
                    })}
                  </span>
                </div>
                <p className="text-sm mt-1 text-muted-foreground">{notification.message}</p>
                {notification.type === 'event' && notification.relatedId && (
                  <Link 
                    to={`/events/${notification.relatedId}`} 
                    className="text-sm text-volunteer-purple mt-2"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    Перейти к мероприятию
                  </Link>
                )}
                {!notification.read && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs mt-2" 
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    Отметить как прочитанное
                  </Button>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
