import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider"
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

import AppLayout from "@/layouts/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppContextProvider } from "@/context/AppContext";
import { AuthContextProvider } from "@/context/AuthContext";

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
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <AppContextProvider>
            <AuthContextProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route element={<ProtectedRoute />}>
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
            </AuthContextProvider>
          </AppContextProvider>
        </TooltipProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
