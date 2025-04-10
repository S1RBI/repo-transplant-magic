
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface TextFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}

const TextField = ({ 
  form, 
  name, 
  label, 
  placeholder, 
  multiline = false,
  className
}: TextFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {multiline ? (
              <Textarea 
                placeholder={placeholder} 
                className={className}
                {...field} 
              />
            ) : (
              <Input 
                placeholder={placeholder}
                {...field} 
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TextField;
