
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Layers,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart,
  Menu,
  LogOut,
  Mail,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { signOut, user, userRole } = useAuth();
  const { theme } = useTheme();

  const navItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/"
    },
    {
      label: "Projects",
      icon: <BarChart className="h-5 w-5" />,
      href: "/projects"
    },
    {
      label: "Panels",
      icon: <Layers className="h-5 w-5" />,
      href: "/panels"
    },
    {
      label: "Messages",
      icon: <Mail className="h-5 w-5" />,
      href: "/messages"
    },
    // Add Users section (only visible to admins)
    ...(userRole === "admin" ? [
      {
        label: "Users",
        icon: <Users className="h-5 w-5" />,
        href: "/users"
      }
    ] : []),
    {
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/settings"
    }
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className={`flex h-screen overflow-hidden bg-volta-background ${theme}`}>
      {/* Mobile Menu Button - Only visible on mobile */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 lg:hidden text-white"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {/* Sidebar - Hidden on mobile unless menu is open */}
      <div
        className={cn(
          "bg-volta-dark text-white flex flex-col transition-all duration-300 ease-in-out relative",
          collapsed ? "w-16" : "w-64",
          isMobile ? "fixed inset-y-0 left-0 z-40" : "relative",
          isMobile && !mobileMenuOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Logo area */}
        <div 
          className={cn(
            "h-16 flex items-center justify-center border-b border-white/10 text-xl font-semibold",
            collapsed ? "px-2" : "px-4"
          )}
        >
          {collapsed ? "QP" : "Qatar Panels"}
        </div>

        {/* Category label */}
        <div className="px-4 py-2 text-sm opacity-70">
          {!collapsed && "Application"}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md transition-colors duration-200",
                    location.pathname === item.href
                      ? "volta-sidebar-item-active"
                      : "volta-sidebar-item"
                  )}
                >
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="p-2 border-t border-white/10">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10",
              collapsed ? "px-2" : "px-3"
            )}
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Sign Out</span>}
          </Button>
        </div>

        {/* Collapse button - Hidden on mobile */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 bg-volta-primary rounded-full border border-white/20 text-white h-6 w-6 flex items-center justify-center"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-xs text-white/50">
          {!collapsed && <div>Doha Extraco © 2024</div>}
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-volta-primary h-16 border-b border-volta-border flex items-center justify-between px-4 text-white">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Qatar Panel Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative text-white">
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">2</span>
              <Mail className="h-5 w-5" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-volta-accent flex items-center justify-center">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-5 bg-volta-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
