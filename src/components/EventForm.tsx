
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { EventCategory, EventStatus, Event } from "@/types";
import { createEvent, updateEvent } from "@/lib/dataService";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import DatePickerField from "./form/DatePickerField";
import NumberField from "./form/NumberField";
import CategorySelect from "./form/CategorySelect";
import TextField from "./form/TextField";

const formSchema = z.object({
  title: z.string().min(5, "Название должно содержать минимум 5 символов"),
  description: z.string().min(20, "Описание должно содержать минимум 20 символов"),
  location: z.string().min(5, "Адрес должен содержать минимум 5 символов"),
  startDate: z.date({
    required_error: "Укажите дату начала мероприятия",
  }),
  endDate: z.date({
    required_error: "Укажите дату окончания мероприятия",
  }),
  maxParticipants: z.number()
    .int("Должно быть целым числом")
    .min(1, "Минимум 1 участник"),
  category: z.nativeEnum(EventCategory),
  hours: z.number()
    .int("Должно быть целым числом")
    .min(1, "Минимум 1 час")
});

type FormData = z.infer<typeof formSchema>;

interface EventFormProps {
  event?: Event;
  onSuccess?: () => void;
}

const EventForm = ({ event, onSuccess }: EventFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues: Partial<FormData> = event 
    ? {
        title: event.title,
        description: event.description,
        location: event.location,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        maxParticipants: event.maxParticipants,
        category: event.category,
        hours: event.hours,
      }
    : {
        maxParticipants: 10,
        hours: 2,
        category: EventCategory.COMMUNITY
      };
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Convert Date objects to ISO strings for the API
      const formattedData = {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
      };
      
      // For the mock data service we use the first organizer
      const organizerData = {
        organizerId: '1',
        organizer: 'Эко-инициатива',
        currentParticipants: event ? event.currentParticipants : 0,
        status: EventStatus.UPCOMING
      };
      
      if (event) {
        // Update existing event
        await updateEvent(event.id, { 
          ...formattedData, 
          ...organizerData 
        });
        toast({ title: "Успех", description: "Мероприятие обновлено" });
      } else {
        // Create new event - ensure all required fields are passed
        await createEvent({
          title: formattedData.title,
          description: formattedData.description,
          location: formattedData.location,
          startDate: formattedData.startDate,
          endDate: formattedData.endDate,
          maxParticipants: formattedData.maxParticipants,
          category: formattedData.category,
          hours: formattedData.hours,
          organizerId: organizerData.organizerId,
          organizer: organizerData.organizer,
          currentParticipants: organizerData.currentParticipants,
          status: organizerData.status
        });
        toast({ title: "Успех", description: "Мероприятие создано" });
        form.reset();
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({ 
        title: "Ошибка", 
        description: "Не удалось сохранить мероприятие", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TextField 
          form={form} 
          name="title" 
          label="Название мероприятия" 
          placeholder="Название мероприятия"
        />
        
        <TextField 
          form={form} 
          name="description" 
          label="Описание" 
          placeholder="Подробное описание мероприятия"
          multiline
          className="min-h-[120px]"
        />
        
        <TextField 
          form={form} 
          name="location" 
          label="Место проведения" 
          placeholder="Адрес или место проведения"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DatePickerField 
            form={form} 
            name="startDate" 
            label="Дата начала" 
          />
          
          <DatePickerField 
            form={form} 
            name="endDate" 
            label="Дата окончания" 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NumberField 
            form={form} 
            name="maxParticipants" 
            label="Макс. количество участников" 
          />
          
          <NumberField 
            form={form} 
            name="hours" 
            label="Количество часов" 
          />
          
          <CategorySelect form={form} />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {event ? "Обновить мероприятие" : "Создать мероприятие"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EventForm;
