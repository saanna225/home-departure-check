import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleCard } from "./ScheduleCard";
import { getChecklists, getSchedules } from "@/lib/storage";
import { Calendar } from "lucide-react";

export const ScheduleView = () => {
  const [schedules, setSchedulesState] = useState(getSchedules());
  const checklists = getChecklists();

  const refreshSchedules = () => {
    setSchedulesState(getSchedules());
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Schedule</h2>
        <p className="text-sm text-muted-foreground">
          Set when you need reminders for each checklist
        </p>
      </div>

      {checklists.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Create some checklists first, then set up your schedule here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {checklists.map((checklist) => {
            const schedule = schedules.find((s) => s.checklistId === checklist.id);
            return (
              <ScheduleCard
                key={checklist.id}
                checklist={checklist}
                schedule={schedule}
                onUpdate={refreshSchedules}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
