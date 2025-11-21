import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addChecklist } from "@/lib/storage";
import { toast } from "sonner";

interface CreateChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const PRESET_COLORS = [
  "hsl(185 75% 45%)",
  "hsl(215 75% 45%)",
  "hsl(145 70% 45%)",
  "hsl(30 95% 60%)",
  "hsl(280 75% 55%)",
  "hsl(0 75% 55%)",
];

export const CreateChecklistDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateChecklistDialogProps) => {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    const newChecklist = {
      id: Date.now().toString(),
      name: name.trim(),
      icon: "List",
      color: selectedColor,
      items: [],
    };

    addChecklist(newChecklist);
    toast.success("Checklist created");
    setName("");
    setSelectedColor(PRESET_COLORS[0]);
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Checklist</DialogTitle>
          <DialogDescription>
            Give your checklist a name and choose a color
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Checklist Name</Label>
            <Input
              id="name"
              placeholder="e.g., Gym, Work, Travel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? "border-foreground scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
