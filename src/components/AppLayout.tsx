
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
    <div className={`flex h-screen overflow-hidden modern-layout ${theme}`}>
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

      {/* Sidebar - Modern design matching the image */}
      <div
        className={cn(
          "modern-sidebar flex flex-col transition-all duration-300 ease-in-out relative",
          collapsed ? "w-16" : "w-64",
          isMobile ? "fixed inset-y-0 left-0 z-40" : "relative",
          isMobile && !mobileMenuOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Logo area - matching the image */}
        <div 
          className={cn(
            "h-16 flex items-center px-4 border-b border-modern-border",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-modern-primary rounded-md flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <div className="font-semibold text-foreground">Doha Extraco</div>
                <div className="text-xs text-muted-foreground">Construction Tracker</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation label */}
        {!collapsed && (
          <div className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Main Navigation
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-2 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm rounded-md transition-all duration-200",
                    location.pathname === item.href
                      ? "modern-sidebar-item-active"
                      : "modern-sidebar-item",
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

        {/* Administration section for admins */}
        {userRole === "admin" && !collapsed && (
          <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-t border-modern-border">
            Administration
          </div>
        )}

        {/* Collapse button - Hidden on mobile */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 bg-white rounded-full border border-modern-border shadow-sm h-6 w-6 flex items-center justify-center hover:shadow-md"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}

        {/* User section at bottom */}
        <div className="p-3 border-t border-modern-border">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full flex items-center text-muted-foreground hover:text-foreground hover:bg-white/50 rounded-md",
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
        {/* Header - Clean design matching the image */}
        <header className="bg-white h-16 border-b border-modern-border flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-foreground">Doha Extraco Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-modern-primary flex items-center justify-center text-white text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 modern-layout">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
