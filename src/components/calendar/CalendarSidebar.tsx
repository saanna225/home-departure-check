import { useState } from "react";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getCalendarEvents, deleteCalendarEvent } from "@/lib/calendarStorage";
import { getChecklists } from "@/lib/storage";
import { CalendarEvent } from "@/lib/types";
import { AddEventDialog } from "./AddEventDialog";

export const CalendarSidebar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(getCalendarEvents());
  const [dialogOpen, setDialogOpen] = useState(false);
  const checklists = getChecklists();

  const refreshEvents = () => {
    setEvents(getCalendarEvents());
  };

  const handleDeleteEvent = (id: string) => {
    deleteCalendarEvent(id);
    refreshEvents();
  };

  const upcomingEvents = events
    .filter((e) => e.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const selectedDateEvents = events.filter(
    (e) => selectedDate && format(e.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <Sidebar className="border-r border-border/40 backdrop-blur-xl bg-background/50">
      <SidebarHeader className="border-b border-border/40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Events</h2>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 pt-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border border-border/40 bg-card/50 backdrop-blur-sm"
            />
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between px-4">
            <SidebarGroupLabel>Upcoming Events</SidebarGroupLabel>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <SidebarGroupContent>
            <ScrollArea className="h-[300px] px-4">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No upcoming events.
                  <br />
                  Add one to get started!
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-lg border border-border/40 bg-card/30 backdrop-blur-sm p-3 hover-lift"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground truncate">
                            {event.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(event.date, "MMM d, yyyy")}
                            {event.time && ` at ${event.time}`}
                          </p>
                          {event.suggestedChecklistIds.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {event.suggestedChecklistIds.map((id) => {
                                const checklist = checklists.find((c) => c.id === id);
                                return checklist ? (
                                  <Badge
                                    key={id}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {checklist.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>

        {selectedDateEvents.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4">
              Events on {format(selectedDate!, "MMM d")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2 px-4">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border border-border/40 bg-card/30 p-2 text-sm"
                  >
                    <p className="font-medium text-foreground">{event.title}</p>
                    {event.time && (
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                    )}
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <AddEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refreshEvents}
      />
    </Sidebar>
  );
};
