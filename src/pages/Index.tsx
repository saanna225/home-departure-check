import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChecklistsView } from "@/components/checklists/ChecklistsView";
import { ScheduleView } from "@/components/schedule/ScheduleView";
import { LocationView } from "@/components/location/LocationView";
import { ReminderPreview } from "@/components/reminders/ReminderPreview";
import { ListChecks, Calendar, MapPin, Bell } from "lucide-react";
import { checkAndTriggerReminders } from "@/lib/reminderEngine";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("checklists");

  // Check for reminders on mount and periodically
  useEffect(() => {
    const checkReminders = async () => {
      const reminders = await checkAndTriggerReminders();
      reminders.forEach((reminder) => {
        const weatherInfo = reminder.weather 
          ? `${reminder.weather.temp}°C, ${reminder.weather.description}` 
          : '';
        const suggestions = reminder.weatherSuggestions?.length 
          ? `\n\nWeather suggestions: ${reminder.weatherSuggestions.map(s => s.item).join(', ')}`
          : '';
        
        toast(reminder.message, {
          description: `${reminder.items.length} items to check${weatherInfo ? ` • ${weatherInfo}` : ''}${suggestions}`,
          action: {
            label: "View List",
            onClick: () => setActiveTab("checklists"),
          },
        });
      });
    };

    // Check on mount
    checkReminders();

    // Check every minute
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">PrepCheck</h1>
          <p className="text-sm text-muted-foreground">Never forget what matters</p>
        </div>
      </header>

      {/* Reminder Preview Banner */}
      <ReminderPreview />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="checklists" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              <span className="hidden sm:inline">Lists</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Location</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checklists" className="mt-0">
            <ChecklistsView />
          </TabsContent>

          <TabsContent value="schedule" className="mt-0">
            <ScheduleView />
          </TabsContent>

          <TabsContent value="location" className="mt-0">
            <LocationView />
          </TabsContent>

          <TabsContent value="reminders" className="mt-0">
            <div className="space-y-4">
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Reminder Preview</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  See what reminders are coming up based on your schedule and location settings.
                  Reminders will appear 15 minutes before your scheduled departure time.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
