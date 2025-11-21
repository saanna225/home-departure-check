import { getChecklists, getSchedules, getSettings } from "./storage";

interface Reminder {
  checklistId: string;
  checklistName: string;
  message: string;
  items: string[];
}

export const checkAndTriggerReminders = (): Reminder[] => {
  const settings = getSettings();
  const checklists = getChecklists();
  const schedules = getSchedules();
  const reminders: Reminder[] = [];

  const now = new Date();
  const currentDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes();

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
      reminders.push({
        checklistId: checklist.id,
        checklistName: checklist.name,
        message: `Time to prepare for ${checklist.name}!`,
        items: checklist.items.filter((item) => !item.checked).map((item) => item.text),
      });
    }
  });

  return reminders;
};

export const getUpcomingReminders = (): Array<{
  checklistName: string;
  time: string;
  day: string;
  items: number;
}> => {
  const checklists = getChecklists();
  const schedules = getSchedules();
  const settings = getSettings();

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
      };
    })
    .filter((r) => r !== null);
};
