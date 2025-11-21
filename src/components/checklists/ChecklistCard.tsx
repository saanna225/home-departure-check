import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { Checklist } from "@/lib/types";
import { updateChecklist, deleteChecklist } from "@/lib/storage";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChecklistCardProps {
  checklist: Checklist;
  onToggleItem: (checklistId: string, itemId: string) => void;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

export const ChecklistCard = ({ checklist, onToggleItem, onDelete, onUpdate }: ChecklistCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleAddItem = () => {
    if (!newItemText.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      text: newItemText,
      checked: false,
    };

    updateChecklist(checklist.id, {
      items: [...checklist.items, newItem],
    });

    setNewItemText("");
    onUpdate();
    toast.success("Item added");
  };

  const handleDeleteItem = (itemId: string) => {
    updateChecklist(checklist.id, {
      items: checklist.items.filter((item) => item.id !== itemId),
    });
    onUpdate();
    toast.success("Item removed");
  };

  const handleDelete = () => {
    deleteChecklist(checklist.id);
    onDelete(checklist.id);
    toast.success("Checklist deleted");
  };

  const completedCount = checklist.items.filter((item) => item.checked).length;
  const totalCount = checklist.items.length;

  return (
    <>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: checklist.color }}
              />
              <div>
                <h3 className="font-semibold text-lg">{checklist.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {completedCount} of {totalCount} completed
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {checklist.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 group">
              <Checkbox
                checked={item.checked}
                onCheckedChange={() => onToggleItem(checklist.id, item.id)}
                className="data-[state=checked]:bg-success data-[state=checked]:border-success"
              />
              <span
                className={`flex-1 transition-all ${
                  item.checked
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {item.text}
              </span>
              {isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}

          {isEditing && (
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="Add new item..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
              />
              <Button onClick={handleAddItem} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Checklist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{checklist.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
