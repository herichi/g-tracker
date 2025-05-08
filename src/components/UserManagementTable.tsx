
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { User, UserRole } from "@/types/user";
import UserList from "@/components/user-management/UserList";
import EditUserDialog from "@/components/user-management/EditUserDialog";
import AddUserDialog from "@/components/user-management/AddUserDialog";
import DeleteUserDialog from "@/components/user-management/DeleteUserDialog";
import useUsersManagement from "@/hooks/useUsersManagement";
import useUserActions from "@/hooks/useUserActions";
import { Table } from "@/components/ui/table";
import UserTableHeader from "@/components/user-management/UserTableHeader";
import UserTablePagination from "@/components/user-management/UserTablePagination";

interface UserManagementTableProps {
  filterRole: UserRole | null;
  filterInactive?: boolean;
}

const UserManagementTable = ({ filterRole, filterInactive = false }: UserManagementTableProps) => {
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});

  const {
    users,
    loading,
    currentPage,
    totalPages,
    sortBy,
    sortOrder,
    fetchUsers,
    handlePageChange,
    handleSortChange,
  } = useUsersManagement({ filterRole, filterInactive });

  const {
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
  } = useUserActions({ onSuccess: fetchUsers });

  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
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
      
      <div className="rounded-md border">
        <Table>
          <UserTableHeader 
            onSortChange={handleSortChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
          <UserList 
            users={users} 
            loading={loading} 
            onEdit={handleEditUser} 
            onDelete={handleDeleteUser}
            expandedUsers={expandedUsers}
            toggleUserExpansion={toggleUserExpansion}
          />
        </Table>
      </div>
      
      <UserTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
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
