import { useState } from "react";
import { Calendar as CalendarIcon, Plus, X, Package } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
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
import { Checkbox } from "@/components/ui/checkbox";
import { getCalendarEvents, deleteCalendarEvent, updateCalendarEvent } from "@/lib/calendarStorage";
import { getChecklists } from "@/lib/storage";
import { CalendarEvent, ChecklistItem } from "@/lib/types";
import { AddEventDialog } from "./AddEventDialog";
import { EditEventDialog } from "./EditEventDialog";
import { matchChecklistsByKeywords } from "@/lib/keywordMatcher";
import { cn } from "@/lib/utils";

export const CalendarSidebar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(getCalendarEvents());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const refreshEvents = () => {
    setEvents(getCalendarEvents());
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    deleteCalendarEvent(id);
    refreshEvents();
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEditDialogOpen(true);
  };

  const handleToggleItem = (eventId: string, itemId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    const checkedItems = event.checkedItems.includes(itemId)
      ? event.checkedItems.filter((id) => id !== itemId)
      : [...event.checkedItems, itemId];

    updateCalendarEvent(eventId, { checkedItems });
    refreshEvents();
  };

  const getEventItems = (event: CalendarEvent): ChecklistItem[] => {
    const items: ChecklistItem[] = [];
    const allChecklists = getChecklists();

    const matchedIds = event.suggestedChecklistIds.length
      ? event.suggestedChecklistIds
      : matchChecklistsByKeywords(event.title, allChecklists);

    matchedIds.forEach((checklistId) => {
      const checklist = allChecklists.find((c) => c.id === checklistId);
      if (checklist) {
        items.push(...checklist.items);
      }
    });
    return items;
  };
  const allEvents = events
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const upcomingEvents = allEvents.filter((e) => !isPast(e.date) || isToday(e.date)).slice(0, 5);
  const pastEvents = allEvents.filter((e) => isPast(e.date) && !isToday(e.date)).slice(0, 3);

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
                  {upcomingEvents.map((event) => {
                    const items = getEventItems(event);
                    const checkedCount = items.filter((item) =>
                      event.checkedItems.includes(item.id)
                    ).length;
                    const isPastEvent = isPast(event.date) && !isToday(event.date);

                    return (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={cn(
                          "rounded-lg border border-border/40 bg-card/30 backdrop-blur-sm p-3 hover-lift transition-opacity cursor-pointer",
                          isPastEvent && "opacity-40"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-foreground truncate">
                              {event.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(event.date, "MMM d, yyyy")}
                              {event.time && ` at ${event.time}`}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={(e) => handleDeleteEvent(event.id, e)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        {items.length > 0 ? (
                          <div className="mt-3 pt-3 border-t border-border/40">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">
                                Pack List ({checkedCount}/{items.length})
                              </span>
                            </div>
                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                              {items.slice(0, 5).map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Checkbox
                                    id={`${event.id}-${item.id}`}
                                    checked={event.checkedItems.includes(item.id)}
                                    onCheckedChange={() =>
                                      handleToggleItem(event.id, item.id)
                                    }
                                    className="h-3 w-3"
                                  />
                                  <label
                                    htmlFor={`${event.id}-${item.id}`}
                                    className={cn(
                                      "text-xs cursor-pointer flex-1",
                                      event.checkedItems.includes(item.id) &&
                                        "line-through text-muted-foreground"
                                    )}
                                  >
                                    {item.text}
                                  </label>
                                </div>
                              ))}
                              {items.length > 5 && (
                                <p className="text-xs text-muted-foreground italic">
                                  +{items.length - 5} more items
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 pt-3 border-t border-border/40 text-center">
                            <p className="text-xs text-muted-foreground">
                              No matching checklists found
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              Try: gym, beach, work
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>

        {pastEvents.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-muted-foreground/70">
              Past Events
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2 px-4">
                {pastEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border border-border/20 bg-card/10 p-2 text-sm opacity-50"
                  >
                    <p className="font-medium text-foreground text-xs">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(event.date, "MMM d, yyyy")}
                    </p>
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

      <EditEventDialog
        event={selectedEvent}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={refreshEvents}
      />
    </Sidebar>
  );
};
