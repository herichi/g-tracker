
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Panels from "./pages/Panels";
import PanelDetail from "./pages/PanelDetail";
import BuildingDetail from "./pages/BuildingDetail";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppProvider>
          <ThemeProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/projects" 
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Projects />
                      </AppLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/project/:projectId" 
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ProjectDetail />
                      </AppLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/building/:buildingId" 
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <BuildingDetail />
                      </AppLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/panels" 
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Panels />
                      </AppLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/panel/:panelId" 
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <PanelDetail />
                      </AppLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/users" 
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Users />
                      </AppLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Settings />
                      </AppLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
