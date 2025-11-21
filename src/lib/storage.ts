import { Checklist, Schedule, Settings } from "./types";

const STORAGE_KEYS = {
  CHECKLISTS: "prepcheck_checklists",
  SCHEDULES: "prepcheck_schedules",
  SETTINGS: "prepcheck_settings",
};

// Default data
const DEFAULT_CHECKLISTS: Checklist[] = [
  {
    id: "gym",
    name: "Gym",
    icon: "Dumbbell",
    color: "hsl(185 75% 45%)",
    items: [
      { id: "1", text: "Water bottle", checked: false },
      { id: "2", text: "Towel", checked: false },
      { id: "3", text: "Gym shoes", checked: false },
      { id: "4", text: "Wireless earbuds", checked: false },
    ],
  },
  {
    id: "work",
    name: "Work",
    icon: "Briefcase",
    color: "hsl(215 75% 45%)",
    items: [
      { id: "1", text: "Laptop", checked: false },
      { id: "2", text: "Wallet", checked: false },
      { id: "3", text: "Keys", checked: false },
      { id: "4", text: "Phone charger", checked: false },
    ],
  },
  {
    id: "beach",
    name: "Beach",
    icon: "Waves",
    color: "hsl(195 85% 55%)",
    items: [
      { id: "1", text: "Swim wear", checked: false },
      { id: "2", text: "Sunglasses", checked: false },
      { id: "3", text: "Scarf", checked: false },
      { id: "4", text: "Sunscreen", checked: false },
      { id: "5", text: "Extra bag", checked: false },
      { id: "6", text: "Sandals", checked: false },
      { id: "7", text: "Towels", checked: false },
    ],
  },
];

const DEFAULT_SETTINGS: Settings = {
  homeLocation: null,
  manualLocation: null,
  useManualLocation: false,
  reminderMinutesBefore: 15,
};

// Checklists
export const getChecklists = (): Checklist[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CHECKLISTS);
  if (!stored) {
    setChecklists(DEFAULT_CHECKLISTS);
    return DEFAULT_CHECKLISTS;
  }
  return JSON.parse(stored);
};

export const setChecklists = (checklists: Checklist[]): void => {
  localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(checklists));
};

export const addChecklist = (checklist: Checklist): void => {
  const checklists = getChecklists();
  setChecklists([...checklists, checklist]);
};

export const updateChecklist = (id: string, updates: Partial<Checklist>): void => {
  const checklists = getChecklists();
  const updated = checklists.map((c) => (c.id === id ? { ...c, ...updates } : c));
  setChecklists(updated);
};

export const deleteChecklist = (id: string): void => {
  const checklists = getChecklists();
  setChecklists(checklists.filter((c) => c.id !== id));
  
  // Also delete associated schedules
  const schedules = getSchedules();
  setSchedules(schedules.filter((s) => s.checklistId !== id));
};

// Schedules
export const getSchedules = (): Schedule[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
  return stored ? JSON.parse(stored) : [];
};

export const setSchedules = (schedules: Schedule[]): void => {
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
};

export const getScheduleForChecklist = (checklistId: string): Schedule | undefined => {
  const schedules = getSchedules();
  return schedules.find((s) => s.checklistId === checklistId);
};

export const updateSchedule = (checklistId: string, schedule: Omit<Schedule, "checklistId">): void => {
  const schedules = getSchedules();
  const existing = schedules.findIndex((s) => s.checklistId === checklistId);
  
  if (existing >= 0) {
    schedules[existing] = { ...schedule, checklistId };
  } else {
    schedules.push({ ...schedule, checklistId });
  }
  
  setSchedules(schedules);
};

export const deleteSchedule = (checklistId: string): void => {
  const schedules = getSchedules();
  setSchedules(schedules.filter((s) => s.checklistId !== checklistId));
};

// Settings
export const getSettings = (): Settings => {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
};

export const setSettings = (settings: Settings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const updateSettings = (updates: Partial<Settings>): void => {
  const settings = getSettings();
  setSettings({ ...settings, ...updates });
};
