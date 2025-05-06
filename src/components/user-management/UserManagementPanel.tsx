
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { UserRole, User } from "@/types/user";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Card, CardContent, CardHeader, 
  CardTitle, CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, UserPlus, ShieldCheck, 
  CheckCircle, XCircle, Loader2 
} from "lucide-react";
import AddUserDialog from "./AddUserDialog";
import EditUserDialog from "./EditUserDialog";
import DeleteUserDialog from "./DeleteUserDialog";
import { 
  Pagination, PaginationContent, PaginationItem, 
  PaginationLink, PaginationNext, PaginationPrevious 
} from "@/components/ui/pagination";

interface UserManagementPanelProps {
  filterRole: UserRole | null;
  filterInactive: boolean;
}

const UserManagementPanel = ({ filterRole, filterInactive }: UserManagementPanelProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const usersPerPage = 10;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Calculate pagination parameters
      const from = (currentPage - 1) * usersPerPage;
      const to = from + usersPerPage - 1;
      
      // Build the query
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });
      
      if (filterRole) {
        query = query.eq('role', filterRole);
      }

      if (filterInactive !== undefined) {
        query = query.eq('active', !filterInactive);
      }

      // Add pagination
      query = query.range(from, to);

      // Execute the query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Set total pages based on count
      if (count) {
        setTotalPages(Math.ceil(count / usersPerPage));
      }
      
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
  }, [filterRole, filterInactive, currentPage]);

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

  const saveUserEdit = async (formData: {
    email: string;
    full_name: string;
    role: string;
    active: boolean;
  }) => {
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
      fetchUsers();
      setEditDialogOpen(false);
    } catch (error: any) {
      toast.error(`Error updating user: ${error.message}`);
      console.error("Error updating user:", error);
    }
  };

  const createUser = async (formData: {
    email: string;
    full_name: string;
    role: string;
    active: boolean;
    password: string;
  }) => {
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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={currentPage === i} 
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem>
                  <span className="px-2">...</span>
                </PaginationItem>
              )}
            </>
          )}
          {pages}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <span className="px-2">...</span>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-amber-500';
      case 'project_manager': return 'bg-blue-500';
      default: return '';
    }
  };

  const formatRoleName = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {filterRole ? formatRoleName(filterRole) : filterInactive ? 'Inactive' : 'Active'} Users
        </h3>
        <Button onClick={handleAddUser} size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {user.role === 'admin' && 
                              <ShieldCheck className="h-4 w-4 text-amber-500" />}
                            {user.full_name || "—"}
                          </div>
                        </TableCell>
                        <TableCell>{user.Email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getRoleBadgeColor(user.role)}`}>
                            {formatRoleName(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.active ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                              <XCircle className="h-3 w-3 mr-1" /> Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.last_sign_in_at 
                            ? new Date(user.last_sign_in_at).toLocaleDateString() 
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(user)} 
                                className="text-red-600 focus:text-red-600">
                                {user.active ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {renderPagination()}
          </CardContent>
        </Card>
      )}
      
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
    </>
  );
};

export default UserManagementPanel;
