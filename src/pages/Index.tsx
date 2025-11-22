import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChecklistsView } from "@/components/checklists/ChecklistsView";
import { ScheduleView } from "@/components/schedule/ScheduleView";
import { LocationView } from "@/components/location/LocationView";
import { ReminderPreview } from "@/components/reminders/ReminderPreview";
import { CalendarSidebar } from "@/components/calendar/CalendarSidebar";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { ListChecks, Calendar, MapPin, Bell, MessageSquare } from "lucide-react";
import { checkAndTriggerReminders } from "@/lib/reminderEngine";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
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
    <SidebarProvider>
      <div className="min-h-screen bg-background relative overflow-hidden flex w-full">
        {/* Animated Background Mesh */}
        <div className="fixed inset-0 gradient-mesh-bg pointer-events-none" />
        
        {/* Floating Orbs */}
        <div className="fixed top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="fixed bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-delayed pointer-events-none" />
        
        {/* Calendar Sidebar */}
        <CalendarSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative z-10">
          {/* Header */}
          <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl shadow-sm">
            <div className="container mx-auto px-4 py-4 flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-pulse-glow">
                  PrepCheck
                </h1>
                <p className="text-sm text-muted-foreground">Never forget what matters</p>
              </div>
            </div>
          </header>

          {/* Reminder Preview Banner */}
          <ReminderPreview />

          {/* Main Content */}
          <main className="container mx-auto px-4 py-6 pb-24 flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-slide-in-up">
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

          {/* Footer Section */}
          <footer className="border-t border-border bg-card/80 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-8 space-y-8">
              {/* Feedback Form */}
              <div className="max-w-2xl mx-auto space-y-4">
                <FeedbackForm />
                
                {/* View Feedback Button */}
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/feedback")}
                    className="gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    View All Feedback
                  </Button>
                </div>
              </div>

              {/* Closing Message */}
              <div className="text-center space-y-2">
                <p className="text-lg font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Now's the time to never get scolded by your mom! 🎒
                </p>
                <p className="text-sm text-muted-foreground">
                  Pack smart, leave stress behind
                </p>
              </div>

              {/* Credits */}
              <div className="text-center space-y-1 pt-4 border-t border-border/40">
                <p className="text-sm text-muted-foreground">
                  Built with ❤️ by <span className="font-semibold text-foreground">Sahana</span>
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Powered by{" "}
                  <a 
                    href="https://lovable.dev" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Lovable
                  </a>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
