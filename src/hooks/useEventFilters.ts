
import { useState, useEffect } from "react";
import { Event } from "@/types";

export function useEventFilters(events: Event[], activeTab: string) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  useEffect(() => {
    applyFilters(events, searchQuery, categoryFilter);
  }, [events, searchQuery, categoryFilter]);

  const applyFilters = (
    eventsToFilter: Event[], 
    query: string, 
    category: string
  ) => {
    let result = [...eventsToFilter];
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(
        event => 
          event.title.toLowerCase().includes(lowerQuery) || 
          event.description.toLowerCase().includes(lowerQuery) ||
          event.location.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (category && category !== "all") {
      result = result.filter(event => event.category === category);
    }
    
    setFilteredEvents(result);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(events, query, categoryFilter);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    applyFilters(events, searchQuery, value);
  };

  return {
    searchQuery,
    categoryFilter,
    filteredEvents,
    handleSearch,
    handleCategoryChange
  };
}
