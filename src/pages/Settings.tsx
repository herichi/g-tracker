
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { UserManagement } from "@/components/UserManagement";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role, last_sign_in_at')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error("Error fetching user data:", error);
            toast({
              title: "Error",
              description: "Failed to fetch user data",
              variant: "destructive"
            });
          } else if (data) {
            setUserRole(data.role);
            setLastLogin(data.last_sign_in_at);
          }
        } catch (error) {
          console.error("Error in data fetch:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchUserData();
  }, [user, toast]);
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully."
    });
  };
  
  const handleExportData = () => {
    toast({
      title: "Data Export Initiated",
      description: "Your data export has been initiated. You will receive a notification when it's ready."
    });
  };
  
  const handleImportData = () => {
    toast({
      title: "Data Import",
      description: "Please select a file to import data."
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-construction-blue"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        {lastLogin && (
          <div className="text-sm text-gray-600">
            Last login: {new Date(lastLogin).toLocaleString()}
          </div>
        )}
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          {userRole === 'admin' && <TabsTrigger value="users">User Management</TabsTrigger>}
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <Switch 
                    id="dark-mode" 
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Enable dark mode for a better experience in low-light environments.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-refresh">Auto-refresh Data</Label>
                  <Switch id="auto-refresh" defaultChecked />
                </div>
                <p className="text-sm text-gray-500">
                  Automatically refresh data at regular intervals.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-view">Compact View</Label>
                  <Switch id="compact-view" />
                </div>
                <p className="text-sm text-gray-500">
                  Display more items per page with a compact layout.
                </p>
              </div>
              
              <div className="pt-4">
                <Button 
                  className="bg-construction-blue hover:bg-construction-blue-dark"
                  onClick={handleSaveSettings}
                >
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <p className="text-sm text-gray-500">
                  Receive email notifications for important updates.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="status-change">Panel Status Changes</Label>
                  <Switch id="status-change" defaultChecked />
                </div>
                <p className="text-sm text-gray-500">
                  Get notified when a panel's status changes.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="project-updates">Project Updates</Label>
                  <Switch id="project-updates" defaultChecked />
                </div>
                <p className="text-sm text-gray-500">
                  Receive notifications for project updates and changes.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly-summary">Weekly Summary</Label>
                  <Switch id="weekly-summary" />
                </div>
                <p className="text-sm text-gray-500">
                  Receive a weekly summary of all project activities.
                </p>
              </div>
              
              <div className="pt-4">
                <Button 
                  className="bg-construction-blue hover:bg-construction-blue-dark"
                  onClick={handleSaveSettings}
                >
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Export Data</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Export all your project and panel data for backup or analysis.
                </p>
                <div className="flex gap-3">
                  <Button 
                    className="bg-construction-blue hover:bg-construction-blue-dark"
                    onClick={handleExportData}
                  >
                    Export All Data
                  </Button>
                  <Button variant="outline">
                    Export Selected Projects
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-medium mb-2">Import Data</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Import project and panel data from external sources.
                </p>
                <Button 
                  variant="outline"
                  onClick={handleImportData}
                >
                  Import Data
                </Button>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-medium mb-2">Data Cleanup</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Remove old or unnecessary data from the system.
                </p>
                <Button variant="destructive">
                  Archive Completed Projects
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {userRole === 'admin' && (
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        )}
        
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Qatar Panel Tracker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Version Information</h3>
                <p className="text-sm">
                  <span className="font-medium">Current Version:</span> 1.0.0
                </p>
                <p className="text-sm">
                  <span className="font-medium">Released:</span> May 5, 2025
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Qatar Panel Tracker is a comprehensive tool for managing construction panels 
                  across multiple projects in Qatar.
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-medium mb-2">Support</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Need help? Contact our support team for assistance.
                </p>
                <Button variant="outline">
                  Contact Support
                </Button>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-medium mb-2">Legal Information</h3>
                <p className="text-sm text-gray-500">
                  © 2025 Doha Extraco. All rights reserved.
                </p>
                <div className="flex gap-4 mt-2">
                  <Button variant="link" className="p-0 h-auto text-construction-blue">
                    Terms of Service
                  </Button>
                  <Button variant="link" className="p-0 h-auto text-construction-blue">
                    Privacy Policy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
