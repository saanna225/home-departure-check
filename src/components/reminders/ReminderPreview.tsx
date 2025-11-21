import { useState, useEffect } from "react";
import { getUpcomingReminders } from "@/lib/reminderEngine";
import { Bell, CloudRain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getWeatherEmoji } from "@/lib/weatherService";

export const ReminderPreview = () => {
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    const loadReminders = async () => {
      const data = await getUpcomingReminders();
      setReminders(data);
    };

    loadReminders();

    // Refresh reminders every minute
    const interval = setInterval(() => {
      loadReminders();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (reminders.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-accent/20 via-accent/25 to-accent/20 border-b border-accent/50 backdrop-blur-sm animate-slide-in-up relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent animate-pulse-glow" />
      <div className="container mx-auto px-4 py-3 relative z-10">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-accent-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-accent-foreground mb-2">
              Upcoming Reminders
            </p>
            <div className="space-y-3">
              {reminders.slice(0, 3).map((reminder, index) => (
                <div key={index} className="text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-accent-foreground">
                      {reminder.checklistName}
                    </span>
                    <span className="text-accent-foreground/70">
                      on {reminder.day} at {reminder.time} ({reminder.items} items)
                    </span>
                    {reminder.weather && (
                      <span className="text-base" title={`${reminder.weather.description}, ${reminder.weather.temp}°C`}>
                        {getWeatherEmoji(reminder.weather)} {reminder.weather.temp}°C
                      </span>
                    )}
                  </div>
                  {reminder.weatherSuggestions && reminder.weatherSuggestions.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <CloudRain className="h-3 w-3 text-accent-foreground/70" />
                      <span className="text-accent-foreground/70">Suggested:</span>
                      {reminder.weatherSuggestions.map((suggestion: any, idx: number) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className="text-xs py-0 h-5 bg-background/50"
                          title={suggestion.reason}
                        >
                          {suggestion.item}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
