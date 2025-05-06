
import React, { useState, useEffect } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, TableHeader, TableBody, TableRow, 
  TableHead, TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, UserPlus, Edit, Trash2, ChevronDown, ChevronUp, Shield, ShieldCheck } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { getRoleNameForDisplay } from "@/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  active: boolean;
}

type UserRole = 
  | 'admin'
  | 'project_manager'
  | 'data_entry'
  | 'production_engineer'
  | 'qc_factory'
  | 'store_site'
  | 'qc_site'
  | 'foreman_site'
  | 'site_engineer';

const roleOptions = [
  { value: 'admin', label: 'Administrator' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'data_entry', label: 'Data Entry' },
  { value: 'production_engineer', label: 'Production Engineer' },
  { value: 'qc_factory', label: 'QC Factory' },
  { value: 'store_site', label: 'Store Site' },
  { value: 'qc_site', label: 'QC Site' },
  { value: 'foreman_site', label: 'Foreman Site' },
  { value: 'site_engineer', label: 'Site Engineer' }
];

const addUserSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().min(2, { message: "Full name is required" }),
  role: z.enum(['admin', 'project_manager', 'data_entry', 'production_engineer', 'qc_factory', 'store_site', 'qc_site', 'foreman_site', 'site_engineer'], { 
    message: "Role is required" 
  }),
  active: z.boolean().default(true)
});

const editUserSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  role: z.enum(['admin', 'project_manager', 'data_entry', 'production_engineer', 'qc_factory', 'store_site', 'qc_site', 'foreman_site', 'site_engineer'], { 
    message: "Role is required" 
  }),
  active: z.boolean()
});

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const { user: currentUser, userRole } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<string>('full_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const usersPerPage = 10;

  const addUserForm = useForm({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      role: "data_entry" as UserRole,
      active: true
    }
  });

  const editUserForm = useForm({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      role: "data_entry" as UserRole,
      active: true
    }
  });

  useEffect(() => {
    if (userRole === 'admin') {
      fetchUsers();
    } else {
      setIsLoading(false);
    }
  }, [currentPage, sortBy, sortOrder, userRole]);

  useEffect(() => {
    if (selectedUser && isEditDialogOpen) {
      editUserForm.setValue("fullName", selectedUser.full_name || "");
      editUserForm.setValue("email", selectedUser.email || "");
      editUserForm.setValue("role", selectedUser.role as UserRole);
      editUserForm.setValue("active", selectedUser.active);
    }
  }, [selectedUser, isEditDialogOpen, editUserForm]);

  const fetchUsers = async () => {
    setIsLoading(true);
    console.log("Admin user is fetching all users with params:", { page: currentPage, sortBy, sortOrder });
    
    try {
      // Calculate pagination parameters
      const from = (currentPage - 1) * usersPerPage;
      const to = from + usersPerPage - 1;
      
      console.log("Querying profiles table with range:", from, to);
      
      // Important: Use direct fetch from profiles table WITHOUT filtering by user_id
      // to get ALL users in the system
      const { data: allProfiles, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to);

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      console.log("Profiles data retrieved successfully:", allProfiles);
      console.log("Total profiles count:", count);

      if (count !== null) {
        setTotalPages(Math.max(1, Math.ceil(count / usersPerPage)));
        console.log(`Total records: ${count}, Total pages: ${Math.ceil(count / usersPerPage)}`);
      }

      if (!allProfiles || allProfiles.length === 0) {
        console.warn("No profiles found in the database");
        setUsers([]);
        setIsLoading(false);
        return;
      }

      // Transform the profiles to our UserProfile interface
      const transformedUsers: UserProfile[] = allProfiles.map(profile => {
        // Default to active if not specified in database
        const isActive = profile.active !== undefined ? profile.active : true;
        
        return {
          id: profile.id,
          email: profile.Email || 'No email',
          full_name: profile.full_name,
          role: profile.role || 'data_entry',
          created_at: profile.updated_at || new Date().toISOString(),
          last_sign_in_at: profile.last_sign_in_at,
          active: isActive
        };
      });

      console.log('Transformed users data for display:', transformedUsers);
      setUsers(transformedUsers);
    } catch (error) {
      console.error("Error in fetchUsers function:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (data: z.infer<typeof addUserSchema>) => {
    try {
      // Sign up the user using standard Supabase auth
      const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (signUpData.user) {
        // Update the profile with the role and active status
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            full_name: data.fullName,
            role: data.role,
            Email: data.email,
            active: data.active
          })
          .eq('id', signUpData.user.id);

        if (profileError) {
          throw profileError;
        }

        toast.success("User created successfully");
        addUserForm.reset();
        setIsAddDialogOpen(false);
        fetchUsers();
      }
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast.error(error.message || "Failed to create user");
    }
  };

  const handleEditUser = async (data: z.infer<typeof editUserSchema>) => {
    if (!selectedUser) return;

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: data.fullName,
          role: data.role,
          Email: data.email,
          active: data.active
        })
        .eq('id', selectedUser.id);

      if (profileError) {
        throw profileError;
      }

      toast.success("User updated successfully");
      editUserForm.reset();
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Failed to update user");
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      const { error } = await supabase
        .from('profiles')
        .update({ active: newStatus })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      
      // Update the local state without refetching from the server
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, active: newStatus } : user
        )
      );
    } catch (error: any) {
      console.error("Error toggling user status:", error);
      toast.error(error.message || `Failed to ${currentStatus ? 'deactivate' : 'activate'} user`);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      // Cannot delete yourself
      if (selectedUser.id === currentUser?.id) {
        toast.error("You cannot delete your own account");
        return;
      }

      // For now, just remove the user from profiles
      // Note: This doesn't actually delete the auth account
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (error) {
        throw error;
      }

      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSortChange = (column: string) => {
    if (sortBy !== column) {
      // If clicking a new column, set it as sort column with ascending order
      setSortBy(column);
      setSortOrder('asc');
    } else {
      // If clicking the same column, toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    }
  };

  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
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

  const getSortIndicator = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  // If user is not admin, show a permission message
  if (userRole !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            You need administrator permissions to access this section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-gray-500">
            Only administrators can view and manage users.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage users and their roles in the system
          </CardDescription>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-construction-blue hover:bg-construction-blue-dark"
        >
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-construction-blue"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSortChange('full_name')}
                  >
                    User {getSortIndicator('full_name')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSortChange('role')}
                  >
                    Role {getSortIndicator('role')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                  >
                    Status
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSortChange('updated_at')}
                  >
                    Created {getSortIndicator('updated_at')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => handleSortChange('last_sign_in_at')}
                  >
                    Last Login {getSortIndicator('last_sign_in_at')}
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map(user => (
                    <React.Fragment key={user.id}>
                      <TableRow className={expandedUsers[user.id] ? "border-b-0" : ""}>
                        <TableCell className="px-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => toggleUserExpansion(user.id)}
                          >
                            {expandedUsers[user.id] ? 
                              <ChevronUp className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="bg-gray-100 rounded-full p-2">
                              <User size={16} className="text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium">{user.full_name || 'No name'}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {user.role === 'admin' && <ShieldCheck size={14} className="text-amber-500" />}
                            <Badge variant="outline" className="capitalize">
                              {getRoleNameForDisplay(user.role as any)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.active ? "success" : "destructive"} className="capitalize">
                            {user.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {user.last_sign_in_at 
                            ? new Date(user.last_sign_in_at).toLocaleDateString() 
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button 
                              variant={user.active ? "ghost" : "outline"} 
                              size="sm"
                              className={user.active ? "text-amber-500 hover:text-amber-700" : "text-green-500 hover:text-green-700"}
                              onClick={() => handleToggleUserStatus(user.id, user.active)}
                              title={user.active ? "Deactivate User" : "Activate User"}
                            >
                              {user.active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteDialogOpen(true);
                              }}
                              disabled={user.id === currentUser?.id}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedUsers[user.id] && (
                        <TableRow>
                          <TableCell className="p-0"></TableCell>
                          <TableCell colSpan={6} className="p-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">User Details</h4>
                                <dl className="space-y-2">
                                  <div className="grid grid-cols-3 gap-1">
                                    <dt className="text-gray-500 text-sm">User ID:</dt>
                                    <dd className="col-span-2 text-sm font-mono truncate">{user.id}</dd>
                                  </div>
                                  <div className="grid grid-cols-3 gap-1">
                                    <dt className="text-gray-500 text-sm">Email:</dt>
                                    <dd className="col-span-2 text-sm">{user.email}</dd>
                                  </div>
                                  <div className="grid grid-cols-3 gap-1">
                                    <dt className="text-gray-500 text-sm">Role:</dt>
                                    <dd className="col-span-2 text-sm">{getRoleNameForDisplay(user.role as any)}</dd>
                                  </div>
                                  <div className="grid grid-cols-3 gap-1">
                                    <dt className="text-gray-500 text-sm">Status:</dt>
                                    <dd className="col-span-2 text-sm">{user.active ? 'Active' : 'Inactive'}</dd>
                                  </div>
                                </dl>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Activity</h4>
                                <dl className="space-y-2">
                                  <div className="grid grid-cols-3 gap-1">
                                    <dt className="text-gray-500 text-sm">Created:</dt>
                                    <dd className="col-span-2 text-sm">
                                      {new Date(user.created_at).toLocaleString()}
                                    </dd>
                                  </div>
                                  <div className="grid grid-cols-3 gap-1">
                                    <dt className="text-gray-500 text-sm">Last Login:</dt>
                                    <dd className="col-span-2 text-sm">
                                      {user.last_sign_in_at 
                                        ? new Date(user.last_sign_in_at).toLocaleString() 
                                        : 'Never'}
                                    </dd>
                                  </div>
                                </dl>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
            {renderPagination()}
          </div>
        )}
      </CardContent>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account and assign appropriate role
            </DialogDescription>
          </DialogHeader>
          <Form {...addUserForm}>
            <form onSubmit={addUserForm.handleSubmit(handleAddUser)} className="space-y-4">
              <FormField
                control={addUserForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addUserForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addUserForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addUserForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addUserForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Account Status
                      </FormLabel>
                      <div className="text-sm text-gray-500">
                        Set whether this account should be active upon creation
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-construction-blue hover:bg-construction-blue-dark"
                >
                  Add User
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and role
            </DialogDescription>
          </DialogHeader>
          <Form {...editUserForm}>
            <form onSubmit={editUserForm.handleSubmit(handleEditUser)} className="space-y-4">
              <FormField
                control={editUserForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Account Status
                      </FormLabel>
                      <div className="text-sm text-gray-500">
                        User can access the system when active
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-construction-blue hover:bg-construction-blue-dark"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            {selectedUser && (
              <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded">
                <User className="text-gray-500" />
                <div>
                  <p className="font-medium">{selectedUser.full_name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteUser}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
