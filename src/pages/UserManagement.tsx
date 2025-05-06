
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import UserManagementTable from "@/components/UserManagementTable";
import { useNavigate } from "react-router-dom";

const UserManagementPage = () => {
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
      
      <Tabs defaultValue="active-users">
        <TabsList>
          <TabsTrigger value="active-users">Active Users</TabsTrigger>
          <TabsTrigger value="inactive-users">Inactive Users</TabsTrigger>
          <TabsTrigger value="admin-users">Admin Users</TabsTrigger>
        </TabsList>
        <TabsContent value="active-users" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
              <CardDescription>
                View and manage users with active accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagementTable filterRole={null} filterInactive={false} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inactive-users" className="space-y-4 mt-4">
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
        <TabsContent value="admin-users" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>
                View and manage users with administrative privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagementTable filterRole="admin" filterInactive={false} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagementPage;
