
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { User } from "@/types/user";
import UserList from "@/components/user-management/UserList";
import EditUserDialog, { EditUserFormData } from "@/components/user-management/EditUserDialog";
import AddUserDialog, { AddUserFormData } from "@/components/user-management/AddUserDialog";
import DeleteUserDialog from "@/components/user-management/DeleteUserDialog";

interface UserManagementTableProps {
  filterRole: string | null;
  filterInactive?: boolean;
}

const UserManagementTable = ({ filterRole, filterInactive = false }: UserManagementTableProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Modified query to get ALL users from the profiles table
      let query = supabase
        .from('profiles')
        .select('*');
      
      if (filterRole) {
        query = query.eq('role', filterRole);
      }

      if (filterInactive) {
        query = query.eq('active', false);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setUsers(data as User[]);
    } catch (error: any) {
      toast.error(`Error fetching users: ${error.message}`);
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterRole, filterInactive]);

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
          role: formData.role,
          active: formData.active,
          Email: formData.email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);

      if (error) throw error;
      
      toast.success("User updated successfully");
      fetchUsers();
      setEditDialogOpen(false);
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
            role: formData.role,
            active: formData.active,
            full_name: formData.full_name,
            Email: formData.email,
            updated_at: new Date().toISOString(),
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;
        
        toast.success("User created successfully");
        fetchUsers();
        setAddDialogOpen(false);
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
      fetchUsers();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(`Error deactivating user: ${error.message}`);
      console.error("Error deactivating user:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Users</h3>
        <Button onClick={handleAddUser} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      <UserList 
        users={users} 
        loading={loading} 
        onEdit={handleEditUser} 
        onDelete={handleDeleteUser} 
      />
      
      <EditUserDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        currentUser={currentUser} 
        onSave={saveUserEdit} 
      />
      
      <AddUserDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onAdd={createUser} 
      />
      
      <DeleteUserDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        currentUser={currentUser} 
        onConfirm={confirmDeleteUser} 
      />
    </div>
  );
};

export default UserManagementTable;
