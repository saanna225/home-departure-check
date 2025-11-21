export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Checklist {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: ChecklistItem[];
}

export interface Schedule {
  checklistId: string;
  days: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  time: string; // "16:00" (24-hour format)
  enabled: boolean;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Settings {
  homeLocation: Location | null;
  manualLocation: Location | null;
  useManualLocation: boolean;
  reminderMinutesBefore: number;
}

export interface WeatherData {
  main: string;
  description: string;
  temp: number;
  feelsLike: number;
  icon: string;
}

export interface WeatherSuggestion {
  item: string;
  reason: string;
}
