
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/types/user";

const Messages = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      setLoading(true);
      try {
        console.log("Messages page: Fetching all users directly from the profiles table");
        
        // Direct query to fetch ALL users regardless of filters
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        console.log(`Messages page: Successfully retrieved ${data?.length || 0} users from database:`, data);
        setUsers(data as User[]);
      } catch (err: any) {
        console.error("Error fetching users in Messages page:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
        <p className="text-muted-foreground">
          All users extracted directly from profiles table
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Database Extract</CardTitle>
          <CardDescription>
            Direct extract from the profiles table - showing all users in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-500 rounded-md">
              Error fetching users: {error}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs truncate max-w-[100px]">{user.id}</TableCell>
                        <TableCell>{user.full_name || "—"}</TableCell>
                        <TableCell>{user.Email || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.active ? "default" : "destructive"}>
                            {user.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.last_sign_in_at 
                            ? new Date(user.last_sign_in_at).toLocaleDateString() 
                            : "Never"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No users found in the database
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          {!loading && !error && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Total users in database: <strong>{users.length}</strong></p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
