
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserManagementTable from "@/components/UserManagementTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const Users = () => {
  const { userRole, isLoading } = useAuth();
  const navigate = useNavigate();

  // Check if user has admin role
  useEffect(() => {
    if (!isLoading && userRole !== "admin") {
      toast.error("You do not have permission to access this page");
      navigate("/");
    }
  }, [userRole, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-[250px]" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Manage your organization's users and their permissions
        </p>
      </div>
      <Separator />
      
      <Tabs defaultValue="all-users">
        <TabsList>
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Users</TabsTrigger>
        </TabsList>
        <TabsContent value="all-users" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                View and manage all users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagementTable filterRole={null} filterInactive={false} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admins" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Administrators</CardTitle>
              <CardDescription>
                Manage users with administrative privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagementTable filterRole="admin" filterInactive={false} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inactive" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Inactive Users</CardTitle>
              <CardDescription>
                View and manage inactive user accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagementTable filterRole={null} filterInactive={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Users;
