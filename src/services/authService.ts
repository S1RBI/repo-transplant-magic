
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Volunteer } from '@/types';
import { createVolunteerProfile } from '@/lib/api/volunteerService';

// Функция для создания профиля волонтера
const createVolunteerProfileFromUser = async (user: User) => {
  try {
    const name = user.user_metadata?.full_name || 'Новый волонтер';
    const email = user.email || '';
    
    console.log('Создание профиля волонтера с данными:', {
      id: user.id,
      name: name,
      email: email
    });
    
    // Убедимся, что все обязательные поля присутствуют и имеют значения
    if (!user.id || !email) {
      console.error('Отсутствуют обязательные поля для создания профиля');
      toast({
        title: 'Ошибка',
        description: 'Невозможно создать профиль - отсутствуют обязательные данные',
        variant: 'destructive',
      });
      return false;
    }
    
    const result = await createVolunteerProfile(user.id, name, email);
    
    if (!result) {
      toast({
        title: 'Ошибка создания профиля',
        description: 'Не удалось создать профиль волонтера',
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка при создании профиля волонтера:', error);
    toast({
      title: 'Ошибка',
      description: 'Произошла ошибка при создании профиля волонтера',
      variant: 'destructive',
    });
    return false;
  }
};

// Функция для получения профиля волонтера
export const fetchVolunteerProfile = async (userId: string): Promise<Volunteer | null> => {
  try {
    console.log('Fetching volunteer profile for user:', userId);
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      // Если запись не найдена, создаем новую
      if (error.code === 'PGRST116') {
        console.log('Запись волонтера не найдена, создаем новую');
        const userData = await supabase.auth.getUser();
        if (userData.data.user) {
          const created = await createVolunteerProfileFromUser(userData.data.user);
          if (created) {
            // Получаем созданный профиль
            return fetchVolunteerProfile(userId);
          }
        }
      } else {
        console.error('Ошибка при запросе данных волонтера:', error);
        return null;
      }
    }
    
    if (data) {
      // Преобразуем данные из БД в формат Volunteer
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        skills: data.skills || [],
        joinedDate: data.joineddate,
        totalHours: data.totalhours || 0,
        eventsAttended: data.eventsattended || 0,
        avatar: data.avatar || undefined
      };
    }
    
    return null;
  } catch (error) {
    console.error('Ошибка при загрузке данных волонтера:', error);
    return null;
  }
};

// Функция для входа в систему
export const signIn = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast({
        title: 'Ошибка входа',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
    
    toast({
      title: 'Успешный вход',
      description: 'Добро пожаловать в систему волонтерской помощи!',
    });
    
    return undefined;
  } catch (error) {
    toast({
      title: 'Ошибка',
      description: 'Произошла неизвестная ошибка при входе',
      variant: 'destructive',
    });
    return { error };
  }
};

// Функция для регистрации
export const signUp = async (email: string, password: string, name: string) => {
  try {
    console.log('Registering user with data:', { email, name });
    
    // 1. Создаем пользователя в auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
    
    if (error) {
      toast({
        title: 'Ошибка регистрации',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
    
    // 2. Если пользователь создан успешно, создаем запись в таблице volunteers
    if (data.user) {
      console.log('User created successfully, creating volunteer profile');
      const created = await createVolunteerProfileFromUser(data.user);
      
      if (!created) {
        return { error: new Error('Failed to create volunteer profile') };
      }
    }
    
    toast({
      title: 'Успешная регистрация',
      description: 'Добро пожаловать в систему волонтерской помощи!',
    });
    
    return undefined;
  } catch (error) {
    console.error('Неизвестная ошибка при регистрации:', error);
    toast({
      title: 'Ошибка',
      description: 'Произошла неизвестная ошибка при регистрации',
      variant: 'destructive',
    });
    return { error };
  }
};

// Функция для выхода из системы
export const signOut = async () => {
  try {
    await supabase.auth.signOut();
    toast({
      title: 'Выход выполнен',
      description: 'Вы успешно вышли из системы',
    });
    return true;
  } catch (error) {
    console.error('Ошибка при выходе:', error);
    toast({
      title: 'Ошибка',
      description: 'Произошла ошибка при выходе из системы',
      variant: 'destructive',
    });
    return false;
  }
};
