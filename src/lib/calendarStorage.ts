import { CalendarEvent } from "./types";

const CALENDAR_KEY = "calendar_events";

export const getCalendarEvents = (): CalendarEvent[] => {
  const stored = localStorage.getItem(CALENDAR_KEY);
  if (!stored) return [];
  
  const events = JSON.parse(stored);
  // Convert date strings back to Date objects
  return events.map((event: any) => ({
    ...event,
    date: new Date(event.date),
  }));
};

export const setCalendarEvents = (events: CalendarEvent[]): void => {
  localStorage.setItem(CALENDAR_KEY, JSON.stringify(events));
};

export const addCalendarEvent = (event: Omit<CalendarEvent, "id" | "checkedItems">): void => {
  const events = getCalendarEvents();
  const newEvent: CalendarEvent = {
    ...event,
    id: Date.now().toString(),
    checkedItems: [],
  };
  events.push(newEvent);
  setCalendarEvents(events);
};

export const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>): void => {
  const events = getCalendarEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...updates };
    setCalendarEvents(events);
  }
};

export const deleteCalendarEvent = (id: string): void => {
  const events = getCalendarEvents().filter((e) => e.id !== id);
  setCalendarEvents(events);
};
