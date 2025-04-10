
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getUpcomingEvents } from '@/lib/dataService';
import { Event, EventCategory } from '@/types';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: 'Вы очень полезный и дружелюбный ассистент для волонтеров. Ваша задача - помогать пользователям с вопросами о волонтерской деятельности, мероприятиях и других аспектах волонтерства. Всегда отвечайте на русском языке.',
    },
    {
      role: 'assistant',
      content: 'Привет! Я ваш ассистент для волонтеров. Чем я могу вам помочь сегодня? Вы можете спросить меня о мероприятиях, возможностях для волонтеров или любых других вопросах, связанных с волонтерской деятельностью. Напишите /help, чтобы увидеть список доступных команд.',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { volunteer } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [volunteerContext, setVolunteerContext] = useState<string>('');

  useEffect(() => {
    // Загружаем контекст о пользователе и предстоящих мероприятиях при первоначальной загрузке
    const loadContext = async () => {
      try {
        if (volunteer) {
          // Загружаем предстоящие мероприятия
          const events = await getUpcomingEvents();
          setUpcomingEvents(events);
          
          // Формируем контекст о волонтере
          let volunteerInfo = `
          Информация о волонтере:
          - Имя: ${volunteer.name}
          - Email: ${volunteer.email}
          - Дата регистрации: ${new Date(volunteer.joinedDate).toLocaleDateString()}
          - Всего часов волонтерства: ${volunteer.totalHours}
          - Посещено мероприятий: ${volunteer.eventsAttended}
          `;
          
          // Добавляем информацию о предстоящих мероприятиях
          if (events.length > 0) {
            volunteerInfo += `\n\nПредстоящие мероприятия:\n`;
            events.slice(0, 5).forEach((event, index) => {
              volunteerInfo += `${index + 1}. "${event.title}" - ${new Date(event.startDate).toLocaleDateString()} - ${getCategoryName(event.category)}\n`;
            });
          } else {
            volunteerInfo += `\n\nВ настоящее время нет предстоящих мероприятий.`;
          }
          
          setVolunteerContext(volunteerInfo);
        }
      } catch (error) {
        console.error("Error loading context:", error);
      }
    };
    
    loadContext();
  }, [volunteer]);

  const getCategoryName = (category: EventCategory) => {
    switch (category) {
      case EventCategory.ENVIRONMENT:
        return "Экология";
      case EventCategory.EDUCATION:
        return "Образование";
      case EventCategory.HEALTH:
        return "Здоровье";
      case EventCategory.COMMUNITY:
        return "Сообщество";
      case EventCategory.ANIMAL:
        return "Животные";
      default:
        return "Другое";
    }
  };

  const handleSpecialCommands = (content: string): string | null => {
    if (content.trim().toLowerCase() === '/help') {
      return `
      Доступные команды:
      - /help - Показать список всех доступных команд
      - /stats - Показать вашу волонтерскую статистику
      - /events - Показать список предстоящих мероприятий
      - /recommend - Получить рекомендацию о мероприятиях, подходящих вам
      - /profile - Показать информацию о вашем профиле
      - /categories - Показать категории мероприятий
      
      Вы также можете задавать вопросы в свободной форме, например:
      - Какие мероприятия по экологии будут в этом месяце?
      - Как мне повысить мой уровень волонтера?
      - Что мне нужно знать перед первым мероприятием?
      `;
    } else if (content.trim().toLowerCase() === '/stats') {
      if (!volunteer) return "Для просмотра статистики необходимо авторизоваться.";
      
      return `
      Ваша статистика:
      - Всего часов волонтерства: ${volunteer.totalHours}
      - Посещено мероприятий: ${volunteer.eventsAttended}
      - Уровень: ${getVolunteerLevel(volunteer.totalHours)}
      - Дата регистрации: ${new Date(volunteer.joinedDate).toLocaleDateString()}
      `;
    } else if (content.trim().toLowerCase() === '/events') {
      if (upcomingEvents.length === 0) {
        return "В настоящее время нет предстоящих мероприятий.";
      }
      
      let response = "Предстоящие мероприятия:\n\n";
      upcomingEvents.forEach((event, index) => {
        response += `${index + 1}. "${event.title}"\n`;
        response += `   Дата: ${new Date(event.startDate).toLocaleDateString()}\n`;
        response += `   Категория: ${getCategoryName(event.category)}\n`;
        response += `   Часы: ${event.hours}\n\n`;
      });
      
      return response;
    } else if (content.trim().toLowerCase() === '/profile') {
      if (!volunteer) return "Для просмотра профиля необходимо авторизоваться.";
      
      return `
      Ваш профиль:
      - Имя: ${volunteer.name}
      - Email: ${volunteer.email}
      - Дата регистрации: ${new Date(volunteer.joinedDate).toLocaleDateString()}
      - Уровень: ${getVolunteerLevel(volunteer.totalHours)}
      `;
    } else if (content.trim().toLowerCase() === '/categories') {
      return `
      Категории мероприятий:
      - Экология - мероприятия, связанные с защитой окружающей среды
      - Образование - образовательные проекты и помощь в обучении
      - Здоровье - мероприятия в сфере здравоохранения
      - Сообщество - социальные проекты для местных сообществ
      - Животные - помощь животным и приютам
      - Другое - прочие волонтерские активности
      `;
    } else if (content.trim().toLowerCase() === '/recommend') {
      if (!volunteer) return "Для получения рекомендаций необходимо авторизоваться.";
      if (upcomingEvents.length === 0) return "В настоящее время нет предстоящих мероприятий для рекомендации.";
      
      // Простая система рекомендаций
      let recommendation: Event | null = null;
      
      // Если у волонтера мало часов, рекомендуем короткое мероприятие
      if (volunteer.totalHours < 10) {
        recommendation = upcomingEvents.find(e => e.hours <= 4);
      } 
      // Если опытный - можно рекомендовать более продолжительное
      else {
        recommendation = upcomingEvents.find(e => e.hours > 4);
      }
      
      // Если не нашли по часам, берем первое доступное
      if (!recommendation && upcomingEvents.length > 0) {
        recommendation = upcomingEvents[0];
      }
      
      if (recommendation) {
        return `
        На основе вашего опыта (${volunteer.totalHours} часов) рекомендую обратить внимание на мероприятие:
        
        "${recommendation.title}"
        Дата: ${new Date(recommendation.startDate).toLocaleDateString()}
        Категория: ${getCategoryName(recommendation.category)}
        Продолжительность: ${recommendation.hours} часов
        
        Это мероприятие хорошо подойдет для вашего уровня опыта.
        `;
      }
      
      return "К сожалению, не удалось подобрать рекомендацию исходя из доступных мероприятий.";
    }
    
    return null;
  };

  const getVolunteerLevel = (hours: number): string => {
    if (hours < 10) return "Начинающий";
    if (hours < 30) return "Опытный";
    return "Эксперт";
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Проверяем на специальные команды
    const commandResponse = handleSpecialCommands(content);
    
    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Если это специальная команда, отвечаем немедленно
    if (commandResponse) {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: commandResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Создаем системный промпт с контекстом о волонтере
      const systemPrompt = `
      Вы очень полезный и дружелюбный ассистент для волонтеров. Ваша задача - помогать пользователям с вопросами о волонтерской деятельности, мероприятиях и других аспектах волонтерства. 
      
      ${volunteerContext}
      
      Всегда отвечайте на русском языке.
      `;
      
      // Copy messages without system messages for display
      const messagesToSend = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...messages.filter(m => m.role !== 'system'), 
        userMessage
      ];
      
      const { data, error: apiError } = await supabase.functions.invoke('deepseek-chat', {
        body: { messages: messagesToSend },
      });
      
      if (apiError) {
        console.error('Supabase error:', apiError);
        throw new Error(`${apiError.message}`);
      }
      
      if (data && data.error) {
        console.error('Error from chat function:', data.error);
        throw new Error(data.error);
      }
      
      let assistantMessage: ChatMessage;
      
      // Handle Gemini API response structure
      if (data && data.choices && data.choices[0] && data.choices[0].message) {
        // OpenAI/Gemini formatted response
        assistantMessage = {
          role: 'assistant',
          content: data.choices[0].message.content,
          timestamp: new Date(),
        };
      } else if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
        // Direct Gemini API response format
        assistantMessage = {
          role: 'assistant',
          content: data.candidates[0].content.parts[0].text,
          timestamp: new Date(),
        };
      } else if (data && data.response) {
        // AI Studio style response
        assistantMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
      } else if (data && (data.text || data.content)) {
        // Generic AI response
        assistantMessage = {
          role: 'assistant',
          content: data.text || data.content,
          timestamp: new Date(),
        };
      } else if (data && typeof data === 'string') {
        // Plain text response
        assistantMessage = {
          role: 'assistant',
          content: data,
          timestamp: new Date(),
        };
      } else {
        // Fallback for unexpected format - try to extract content from data
        console.warn('Unexpected response structure:', data);
        let content = 'Извините, я не смог правильно обработать ответ от AI сервиса.';
        
        // Try to extract text from the data object
        if (data && typeof data === 'object') {
          // Look for any property that might contain the response text
          const possibleTextProps = ['text', 'content', 'message', 'answer', 'response', 'result'];
          for (const prop of possibleTextProps) {
            if (data[prop] && typeof data[prop] === 'string') {
              content = data[prop];
              break;
            }
            // Try nested objects too
            if (data[prop] && typeof data[prop] === 'object') {
              // Check common response patterns
              if (data[prop].content) {
                content = data[prop].content;
                break;
              } else if (data[prop].text) {
                content = data[prop].text;
                break;
              } else if (data[prop].message && data[prop].message.content) {
                content = data[prop].message.content;
                break;
              } else if (data[prop].parts && data[prop].parts[0] && data[prop].parts[0].text) {
                content = data[prop].parts[0].text;
                break;
              }
            }
          }
        }
        
        assistantMessage = {
          role: 'assistant',
          content: content,
          timestamp: new Date(),
        };
      }
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Произошла ошибка при отправке сообщения');
      toast({
        title: "Ошибка чата",
        description: err.message || 'Произошла ошибка при обработке вашего запроса',
        variant: "destructive",
      });
      
      // Add fallback message in case of error
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте задать вопрос позже или сформулировать его иначе.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages: messages.filter(m => m.role !== 'system'),
    sendMessage,
    isLoading,
    error
  };
}
