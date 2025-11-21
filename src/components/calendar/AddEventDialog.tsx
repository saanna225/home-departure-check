import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { addCalendarEvent } from "@/lib/calendarStorage";
import { getChecklists } from "@/lib/storage";
import { matchChecklistsByKeywords } from "@/lib/keywordMatcher";
import { toast } from "sonner";

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddEventDialog = ({ open, onOpenChange, onSuccess }: AddEventDialogProps) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const checklists = getChecklists();

  const suggestedChecklists = title
    ? matchChecklistsByKeywords(title, checklists)
    : [];

  const handleCreate = () => {
    if (!title.trim() || !date) {
      toast.error("Please enter a title and select a date");
      return;
    }

    addCalendarEvent({
      title: title.trim(),
      date,
      time: time || undefined,
      suggestedChecklistIds: suggestedChecklists,
      notes: notes || undefined,
    });

    toast.success("Event added!");
    setTitle("");
    setDate(undefined);
    setTime("");
    setNotes("");
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Calendar Event</DialogTitle>
          <DialogDescription>
            Create an event and we'll suggest relevant checklists based on keywords.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              placeholder="e.g., Beach trip, Gym session, Work meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "MMM d, yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time (optional)</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="Additional details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {suggestedChecklists.length > 0 && (
            <div className="space-y-2">
              <Label>Suggested Checklists</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                {suggestedChecklists.map((id) => {
                  const checklist = checklists.find((c) => c.id === id);
                  return checklist ? (
                    <Badge key={id} variant="secondary" className="gap-1">
                      <span>{checklist.icon}</span>
                      {checklist.name}
                    </Badge>
                  ) : null;
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                These checklists match your event keywords
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
