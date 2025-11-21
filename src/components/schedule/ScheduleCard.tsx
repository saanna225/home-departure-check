import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checklist, Schedule } from "@/lib/types";
import { updateSchedule } from "@/lib/storage";
import { toast } from "sonner";

interface ScheduleCardProps {
  checklist: Checklist;
  schedule?: Schedule;
  onUpdate: () => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const ScheduleCard = ({ checklist, schedule, onUpdate }: ScheduleCardProps) => {
  const [enabled, setEnabled] = useState(schedule?.enabled ?? false);
  const [selectedDays, setSelectedDays] = useState<string[]>(schedule?.days ?? []);
  const [time, setTime] = useState(schedule?.time ?? "16:00");

  const handleSave = () => {
    if (enabled && selectedDays.length === 0) {
      toast.error("Please select at least one day");
      return;
    }

    updateSchedule(checklist.id, {
      days: selectedDays,
      time,
      enabled,
    });

    toast.success("Schedule updated");
    onUpdate();
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <Card className="hover-lift border-border/50 bg-gradient-to-br from-card to-card/95 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: checklist.color }}
            />
            <CardTitle className="text-lg">{checklist.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor={`enabled-${checklist.id}`} className="text-sm">
              Enabled
            </Label>
            <Switch
              id={`enabled-${checklist.id}`}
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Days</Label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((day) => (
              <Button
                key={day}
                variant={selectedDays.includes(day) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleDay(day)}
                disabled={!enabled}
              >
                {day}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`time-${checklist.id}`} className="text-sm font-medium">
            Departure Time
          </Label>
          <Input
            id={`time-${checklist.id}`}
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={!enabled}
          />
          <p className="text-xs text-muted-foreground">
            You'll receive a reminder 15 minutes before this time
          </p>
        </div>

        <Button onClick={handleSave} className="w-full" disabled={!enabled}>
          Save Schedule
        </Button>
      </CardContent>
    </Card>
  );
};
