import { getChecklists, getSchedules, getSettings } from "./storage";
import { getCurrentWeather, getWeatherSuggestions, getWeatherEmoji } from "./weatherService";
import type { WeatherData, WeatherSuggestion } from "./types";

interface Reminder {
  checklistId: string;
  checklistName: string;
  message: string;
  items: string[];
  weather?: WeatherData | null;
  weatherSuggestions?: WeatherSuggestion[];
}

export const checkAndTriggerReminders = async (): Promise<Reminder[]> => {
  const settings = getSettings();
  const checklists = getChecklists();
  const schedules = getSchedules();
  const reminders: Reminder[] = [];

  const now = new Date();
  const currentDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Get weather data if location is available
  let weather: WeatherData | null = null;
  let weatherSuggestions: WeatherSuggestion[] = [];

  const location = settings.useManualLocation 
    ? settings.manualLocation 
    : settings.homeLocation;

  if (location) {
    weather = await getCurrentWeather(location.latitude, location.longitude);
    weatherSuggestions = getWeatherSuggestions(weather);
  }

  schedules.forEach((schedule) => {
    if (!schedule.enabled) return;
    if (!schedule.days.includes(currentDay)) return;

    const checklist = checklists.find((c) => c.id === schedule.checklistId);
    if (!checklist) return;

    // Parse schedule time
    const [hours, minutes] = schedule.time.split(":").map(Number);
    const scheduleTime = hours * 60 + minutes;
    
    // Calculate reminder time
    const reminderTime = scheduleTime - settings.reminderMinutesBefore;
    
    // Check if we should trigger reminder (within 1 minute window)
    if (Math.abs(currentTime - reminderTime) <= 1) {
      const weatherEmoji = weather ? getWeatherEmoji(weather) : '';
      const weatherTemp = weather ? ` (${weather.temp}°C)` : '';
      
      reminders.push({
        checklistId: checklist.id,
        checklistName: checklist.name,
        message: `${weatherEmoji} Time to prepare for ${checklist.name}!${weatherTemp}`,
        items: checklist.items.filter((item) => !item.checked).map((item) => item.text),
        weather,
        weatherSuggestions,
      });
    }
  });

  return reminders;
};

export const getUpcomingReminders = async (): Promise<Array<{
  checklistName: string;
  time: string;
  day: string;
  items: number;
  weather?: WeatherData | null;
  weatherSuggestions?: WeatherSuggestion[];
}>> => {
  const checklists = getChecklists();
  const schedules = getSchedules();
  const settings = getSettings();

  // Get weather data
  let weather: WeatherData | null = null;
  let weatherSuggestions: WeatherSuggestion[] = [];

  const location = settings.useManualLocation 
    ? settings.manualLocation 
    : settings.homeLocation;

  if (location) {
    weather = await getCurrentWeather(location.latitude, location.longitude);
    weatherSuggestions = getWeatherSuggestions(weather);
  }

  return schedules
    .filter((s) => s.enabled)
    .map((schedule) => {
      const checklist = checklists.find((c) => c.id === schedule.checklistId);
      if (!checklist) return null;

      const uncheckedItems = checklist.items.filter((item) => !item.checked).length;

      return {
        checklistName: checklist.name,
        time: schedule.time,
        day: schedule.days.join(", "),
        items: uncheckedItems,
        weather,
        weatherSuggestions,
      };
    })
    .filter((r) => r !== null);
};
