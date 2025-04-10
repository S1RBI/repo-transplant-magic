
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EventCategory } from "@/types";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface EventFiltersProps {
  searchQuery: string;
  categoryFilter: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (value: string) => void;
}

const EventFilters = ({
  searchQuery,
  categoryFilter,
  onSearchChange,
  onCategoryChange
}: EventFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mt-4">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Поиск мероприятий..."
          className="pl-10"
          value={searchQuery}
          onChange={onSearchChange}
        />
      </div>
      
      <div className="w-full md:w-64">
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Все категории" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            <SelectItem value={EventCategory.ENVIRONMENT}>Экология</SelectItem>
            <SelectItem value={EventCategory.EDUCATION}>Образование</SelectItem>
            <SelectItem value={EventCategory.HEALTH}>Здоровье</SelectItem>
            <SelectItem value={EventCategory.COMMUNITY}>Сообщество</SelectItem>
            <SelectItem value={EventCategory.ANIMAL}>Животные</SelectItem>
            <SelectItem value={EventCategory.OTHER}>Другое</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default EventFilters;
