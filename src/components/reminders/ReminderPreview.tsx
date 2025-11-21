import { useState, useEffect } from "react";
import { getUpcomingReminders } from "@/lib/reminderEngine";
import { Bell } from "lucide-react";

export const ReminderPreview = () => {
  const [reminders, setReminders] = useState(getUpcomingReminders());

  useEffect(() => {
    // Refresh reminders every minute
    const interval = setInterval(() => {
      setReminders(getUpcomingReminders());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (reminders.length === 0) return null;

  return (
    <div className="bg-accent/20 border-b border-accent">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-accent-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-accent-foreground mb-1">
              Upcoming Reminders
            </p>
            <div className="space-y-1">
              {reminders.slice(0, 3).map((reminder, index) => (
                <p key={index} className="text-xs text-accent-foreground/80">
                  <span className="font-medium">{reminder.checklistName}</span> on{" "}
                  {reminder.day} at {reminder.time} ({reminder.items} items)
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
