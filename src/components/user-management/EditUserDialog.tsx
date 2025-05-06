
import { useState } from "react";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const roleOptions: { value: string; label: string }[] = [
  { value: "admin", label: "Administrator" },
  { value: "project_manager", label: "Project Manager" },
  { value: "data_entry", label: "Data Entry" },
  { value: "production_engineer", label: "Production Engineer" },
  { value: "qc_factory", label: "QC Factory" },
  { value: "store_site", label: "Store Site" },
  { value: "qc_site", label: "QC Site" },
  { value: "foreman_site", label: "Foreman" },
  { value: "site_engineer", label: "Site Engineer" },
];

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: User | null;
  onSave: (formData: EditUserFormData) => void;
}

export interface EditUserFormData {
  email: string;
  full_name: string;
  role: string;
  active: boolean;
  password?: string;
}

const EditUserDialog = ({ open, onOpenChange, currentUser, onSave }: EditUserDialogProps) => {
  const [formData, setFormData] = useState<EditUserFormData>({
    email: currentUser?.Email || "",
    full_name: currentUser?.full_name || "",
    role: currentUser?.role || "data_entry",
    active: currentUser?.active ?? true,
    password: "",
  });

  // Update form data when currentUser changes
  useState(() => {
    if (currentUser) {
      setFormData({
        email: currentUser.Email || "",
        full_name: currentUser.full_name || "",
        role: currentUser.role || "data_entry",
        active: currentUser.active ?? true,
        password: "", // We don't set the password when editing
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value });
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData({ ...formData, active: checked });
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Make changes to the user account. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="full_name" className="text-right">
              Full Name
            </Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="active" className="text-right">
              Active
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch 
                id="active" 
                checked={formData.active} 
                onCheckedChange={handleActiveChange} 
              />
              <Label htmlFor="active">{formData.active ? "Active" : "Inactive"}</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
