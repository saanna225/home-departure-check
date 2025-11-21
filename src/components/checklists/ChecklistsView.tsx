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

      {checklists.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground mb-4">No checklists yet. Create your first one!</p>
          <Button onClick={() => setCreateDialogOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create Checklist
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {checklists.map((checklist) => (
            <ChecklistCard
              key={checklist.id}
              checklist={checklist}
              onToggleItem={handleToggleItem}
              onDelete={handleDeleteChecklist}
              onUpdate={refreshChecklists}
            />
          ))}
        </div>
      )}

      <CreateChecklistDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refreshChecklists}
      />
    </div>
  );
};
