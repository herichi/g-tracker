
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/types/user";
import { toast } from "@/components/ui/sonner";
import { AddUserFormData } from "@/components/user-management/AddUserDialog";
import { EditUserFormData } from "@/components/user-management/EditUserDialog";

interface UseUserActionsProps {
  onSuccess: () => void;
}

export const useUserActions = ({ onSuccess }: UseUserActionsProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setEditDialogOpen(true);
  };

  const handleAddUser = () => {
    setAddDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setCurrentUser(user);
    setDeleteDialogOpen(true);
  };

  const saveUserEdit = async (formData: EditUserFormData) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          role: formData.role as UserRole,
          active: formData.active,
          Email: formData.email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);

      if (error) throw error;
      
      toast.success("User updated successfully");
      setEditDialogOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(`Error updating user: ${error.message}`);
      console.error("Error updating user:", error);
    }
  };

  const createUser = async (formData: AddUserFormData) => {
    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          full_name: formData.full_name,
        }
      });

      if (authError) throw authError;
      
      if (authData.user) {
        // Then update the user's profile with additional data
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: formData.role as UserRole,
            active: formData.active,
            full_name: formData.full_name,
            Email: formData.email,
            updated_at: new Date().toISOString(),
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;
        
        toast.success("User created successfully");
        setAddDialogOpen(false);
        onSuccess();
      }
    } catch (error: any) {
      toast.error(`Error creating user: ${error.message}`);
      console.error("Error creating user:", error);
    }
  };

  const confirmDeleteUser = async () => {
    if (!currentUser) return;
    
    try {
      // Soft delete by setting active status to false
      const { error } = await supabase
        .from('profiles')
        .update({
          active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);

      if (error) throw error;
      
      toast.success("User deactivated successfully");
      setDeleteDialogOpen(false);
      setCurrentUser(null);
      onSuccess();
    } catch (error: any) {
      toast.error(`Error deactivating user: ${error.message}`);
      console.error("Error deactivating user:", error);
    }
  };

  return {
    currentUser,
    editDialogOpen,
    addDialogOpen,
    deleteDialogOpen,
    setEditDialogOpen,
    setAddDialogOpen,
    setDeleteDialogOpen,
    handleEditUser,
    handleAddUser,
    handleDeleteUser,
    saveUserEdit,
    createUser,
    confirmDeleteUser,
  };
};

export default useUserActions;
