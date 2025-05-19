
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"

import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Panels from "@/pages/Panels";
import PanelDetail from "@/pages/PanelDetail";
import BuildingDetail from "@/pages/BuildingDetail";
import Reports from "@/pages/Reports";
import Messages from "@/pages/Messages";
import Settings from "@/pages/Settings";
import UserManagement from "@/pages/UserManagement";
import NotFound from "@/pages/NotFound";
import NewPanel from "@/pages/NewPanel";

import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <TooltipProvider>
          <AppProvider>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route element={
                  <ProtectedRoute>
                    <Outlet />
                  </ProtectedRoute>
                }>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/project/:projectId" element={<ProjectDetail />} />
                    <Route path="/panels" element={<Panels />} />
                    <Route path="/panel/new" element={<NewPanel />} />
                    <Route path="/panel/:panelId" element={<PanelDetail />} />
                    <Route path="/building/:buildingId" element={<BuildingDetail />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/user-management" element={<UserManagement />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </AuthProvider>
          </AppProvider>
        </TooltipProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
