
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppProvider } from '@/context/AppContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import Items from '@/pages/Items';
import ProjectDetail from '@/pages/ProjectDetail';
import BuildingDetail from '@/pages/BuildingDetail';
import PanelDetail from '@/pages/PanelDetail';
import Reports from '@/pages/Reports';
import Auth from '@/pages/Auth';
import ResetPassword from '@/pages/ResetPassword';
import Settings from '@/pages/Settings';
import Users from '@/pages/Users';
import UserManagement from '@/pages/UserManagement';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Index />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/projects" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Projects />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/items" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Items />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/projects/:id" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ProjectDetail />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/projects/:projectId/buildings/:buildingId" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <BuildingDetail />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/panel/:id" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <PanelDetail />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Reports />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Settings />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/users" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Users />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/user-management" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <UserManagement />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
            <Toaster />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
