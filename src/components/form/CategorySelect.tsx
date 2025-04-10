
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventCategory } from "@/types";
import { UseFormReturn } from "react-hook-form";

interface CategorySelectProps {
  form: UseFormReturn<any>;
}

const CategorySelect = ({ form }: CategorySelectProps) => {
  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Категория</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value={EventCategory.ENVIRONMENT}>Экология</SelectItem>
              <SelectItem value={EventCategory.EDUCATION}>Образование</SelectItem>
              <SelectItem value={EventCategory.HEALTH}>Здоровье</SelectItem>
              <SelectItem value={EventCategory.COMMUNITY}>Сообщество</SelectItem>
              <SelectItem value={EventCategory.ANIMAL}>Животные</SelectItem>
              <SelectItem value={EventCategory.OTHER}>Другое</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CategorySelect;
