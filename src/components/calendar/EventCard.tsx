import { format } from "date-fns";
import { X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarEvent, ChecklistItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSwipe } from "@/hooks/useSwipe";
import { toast } from "sonner";

interface EventCardProps {
  event: CalendarEvent;
  items: ChecklistItem[];
  checkedCount: number;
  isPastEvent: boolean;
  onEventClick: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string, e: React.MouseEvent) => void;
  onToggleItem: (eventId: string, itemId: string) => void;
}

export const EventCard = ({
  event,
  items,
  checkedCount,
  isPastEvent,
  onEventClick,
  onDeleteEvent,
  onToggleItem,
}: EventCardProps) => {
  const swipeRef = useSwipe({
    onSwipeLeft: () => {
      toast("Swipe right to delete", {
        description: "Swipe the event card to the right to delete it",
      });
    },
    onSwipeRight: () => {
      const syntheticEvent = new MouseEvent("click") as any;
      onDeleteEvent(event.id, syntheticEvent);
    },
  });

  return (
    <div
      ref={swipeRef}
      onClick={() => onEventClick(event)}
      className={cn(
        "rounded-lg border border-border/40 bg-card/30 backdrop-blur-sm p-3 hover-lift transition-opacity cursor-pointer touch-pan-y",
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
          onClick={(e) => onDeleteEvent(event.id, e)}
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
                  onCheckedChange={() => onToggleItem(event.id, item.id)}
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
        </div>
      )}
    </div>
  );
};
