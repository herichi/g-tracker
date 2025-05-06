
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
  DialogTrigger
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
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, UserPlus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { getRoleNameForDisplay } from "@/types";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
}

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
  role: z.string().min(1, { message: "Role is required" })
});

const editUserSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  role: z.string().min(1, { message: "Role is required" })
});

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const toast = useToast();
  const { user: currentUser } = useAuth();

  const addUserForm = useForm({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      role: "data_entry"
    }
  });

  const editUserForm = useForm({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      fullName: "",
      role: ""
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser && isEditDialogOpen) {
      editUserForm.setValue("fullName", selectedUser.full_name || "");
      editUserForm.setValue("role", selectedUser.role);
    }
  }, [selectedUser, isEditDialogOpen, editUserForm]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // First get all users from auth schema
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw authError;
      }

      if (!authUsers) {
        setUsers([]);
        return;
      }

      // Then get profile information from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, role');

      if (profilesError) {
        throw profilesError;
      }

      // Combine the data
      const combinedUsers = authUsers.users.map(authUser => {
        const profile = profiles?.find(p => p.id === authUser.id) || { 
          full_name: null, 
          role: 'data_entry' 
        };

        return {
          id: authUser.id,
          email: authUser.email || 'No email',
          full_name: profile.full_name,
          role: profile.role,
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (data: z.infer<typeof addUserSchema>) => {
    try {
      // Create the user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          full_name: data.fullName
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Update the profile with the role
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            full_name: data.fullName,
            role: data.role 
          })
          .eq('id', authData.user.id);

        if (profileError) {
          throw profileError;
        }

        toast.success("User created successfully");
        addUserForm.reset();
        setIsAddDialogOpen(false);
        fetchUsers();
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to create user");
    }
  };

  const handleEditUser = async (data: z.infer<typeof editUserSchema>) => {
    if (!selectedUser) return;

    try {
      // Update user metadata
      const { error: authError } = await supabase.auth.admin.updateUserById(
        selectedUser.id,
        { user_metadata: { full_name: data.fullName } }
      );

      if (authError) {
        throw authError;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: data.fullName,
          role: data.role 
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
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
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

      // Delete the user
      const { error } = await supabase.auth.admin.deleteUser(selectedUser.id);

      if (error) {
        throw error;
      }

      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

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
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map(user => (
                    <TableRow key={user.id}>
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
                        <Badge variant="outline" className="capitalize">
                          {getRoleNameForDisplay(user.role as any)}
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
                  ))
                )}
              </TableBody>
            </Table>
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
