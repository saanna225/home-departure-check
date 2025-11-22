import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChecklistCard } from "./ChecklistCard";
import { CreateChecklistDialog } from "./CreateChecklistDialog";
import { getChecklists, setChecklists } from "@/lib/storage";

export const ChecklistsView = () => {
  const [checklists, setChecklistsState] = useState(getChecklists());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const refreshChecklists = () => {
    setChecklistsState(getChecklists());
  };

  const handleToggleItem = (checklistId: string, itemId: string) => {
    const updated = checklists.map((checklist) => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          items: checklist.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        };
      }
      return checklist;
    });
    setChecklists(updated);
    setChecklistsState(updated);
  };

  const handleDeleteChecklist = (id: string) => {
    const updated = checklists.filter((c) => c.id !== id);
    setChecklists(updated);
    setChecklistsState(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Checklists</h2>
          <p className="text-sm text-muted-foreground">Manage items you need for different activities</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New List
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {checklists.length === 0 && (
          <div className="opacity-40 pointer-events-none select-none col-span-full md:col-span-1">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-dashed border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Example: Gym</h3>
                <span className="text-xs text-muted-foreground">Demo</span>
              </div>
              <div className="space-y-2">
                {["Water bottle", "Towel", "Gym shoes"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded border border-muted-foreground/30" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {checklists.map((checklist) => (
          <ChecklistCard
            key={checklist.id}
            checklist={checklist}
            onToggleItem={handleToggleItem}
            onDelete={handleDeleteChecklist}
            onUpdate={refreshChecklists}
          />
        ))}

        {checklists.length === 0 && (
          <div className="col-span-full md:col-span-1 text-center py-12 bg-card rounded-lg border border-dashed border-border">
            <p className="text-muted-foreground mb-4">Create your first checklist!</p>
            <Button onClick={() => setCreateDialogOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Checklist
            </Button>
          </div>
        )}
      </div>

      <CreateChecklistDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refreshChecklists}
      />
    </div>
  );
};
