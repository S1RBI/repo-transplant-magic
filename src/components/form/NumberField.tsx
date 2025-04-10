
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface NumberFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  min?: number;
  placeholder?: string;
}

const NumberField = ({ form, name, label, min = 1, placeholder }: NumberFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              min={min}
              placeholder={placeholder}
              {...field}
              onChange={e => field.onChange(parseInt(e.target.value))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default NumberField;
