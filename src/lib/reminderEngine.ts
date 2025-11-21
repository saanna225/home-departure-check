import { getChecklists, getSchedules, getSettings } from "./storage";
import { getCalendarEvents } from "./calendarStorage";
import { getCurrentWeather, getWeatherSuggestions, getWeatherEmoji } from "./weatherService";
import type { WeatherData, WeatherSuggestion, CalendarEvent } from "./types";
import { isToday } from "date-fns";

interface Reminder {
  checklistId?: string;
  eventId?: string;
  checklistName: string;
  message: string;
  items: string[];
  weather?: WeatherData | null;
  weatherSuggestions?: WeatherSuggestion[];
  isEventReminder?: boolean;
}

export const checkAndTriggerReminders = async (): Promise<Reminder[]> => {
  const settings = getSettings();
  const checklists = getChecklists();
  const schedules = getSchedules();
  const calendarEvents = getCalendarEvents();
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

  // Check schedule-based reminders
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

  // Check event-based reminders (for today's events with unchecked items)
  calendarEvents.forEach((event) => {
    if (!isToday(event.date)) return;

    // Get all items for this event
    const allEventItems: string[] = [];
    event.suggestedChecklistIds.forEach((checklistId) => {
      const checklist = checklists.find((c) => c.id === checklistId);
      if (checklist) {
        checklist.items.forEach((item) => {
          if (!event.checkedItems.includes(item.id)) {
            allEventItems.push(item.text);
          }
        });
      }
    });

    // Only send reminder if there are unchecked items and it's the event time (or within 15 min before)
    if (allEventItems.length > 0 && event.time) {
      const [eventHours, eventMinutes] = event.time.split(":").map(Number);
      const eventTime = eventHours * 60 + eventMinutes;
      const reminderWindowStart = eventTime - 15;
      
      // Trigger reminder if we're within 15 minutes before the event
      if (currentTime >= reminderWindowStart && currentTime <= eventTime) {
        const weatherEmoji = weather ? getWeatherEmoji(weather) : '📅';
        
        reminders.push({
          eventId: event.id,
          checklistName: event.title,
          message: `${weatherEmoji} Don't forget items for ${event.title}!`,
          items: allEventItems,
          weather,
          weatherSuggestions,
          isEventReminder: true,
        });
      }
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
