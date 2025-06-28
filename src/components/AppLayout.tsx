
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
  Users,
  FileText,
  Building,
  QrCode,
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
      label: "Items",
      icon: <Building className="h-5 w-5" />,
      href: "/items"  
    },
    {
      label: "QR Scanner",
      icon: <QrCode className="h-5 w-5" />,
      href: "/qr-scanner"
    },
    {
      label: "Reports",
      icon: <FileText className="h-5 w-5" />,
      href: "/reports"
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
    <div className={`flex h-screen overflow-hidden ${theme}`}>
      {/* Mobile Menu Button - Only visible on mobile */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 lg:hidden"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out relative shadow-sm",
          collapsed ? "w-16" : "w-64",
          isMobile ? "fixed inset-y-0 left-0 z-40" : "relative",
          isMobile && !mobileMenuOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <Layers className="h-8 w-8 text-blue-600" />
            {!collapsed && (
              <span className="font-bold text-black">Doha Extraco</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto bg-white">
          <ul className="space-y-2 px-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                    location.pathname === item.href
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-black",
                    collapsed && "justify-center"
                  )}
                >
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse button - Hidden on mobile */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 bg-white rounded-full border border-gray-200 shadow-sm h-6 w-6 flex items-center justify-center hover:bg-gray-50"
          >
            {collapsed ? <ChevronRight className="h-4 w-4 text-gray-600" /> : <ChevronLeft className="h-4 w-4 text-gray-600" />}
          </Button>
        )}

        {/* User section at bottom */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full flex items-center text-gray-700 hover:bg-gray-50 hover:text-black",
              collapsed ? "justify-center px-2" : "justify-start px-3"
            )}
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-3 text-sm">Sign Out</span>}
          </Button>
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
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-black">Doha Extraco Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
