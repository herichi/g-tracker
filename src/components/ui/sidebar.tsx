import * as React from "react"
import {
  Home,
  LayoutGrid,
  Settings,
  Users,
  Layers,
  UserCog,
} from "lucide-react"
import { useLocation } from "react-router-dom";

import { useSidebar } from "@/components/providers/sidebar-provider"
import { SidebarNavItem } from "@/components/ui/sidebar-nav"
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {}

export const Sidebar = ({ className, ...props }: SidebarProps) => {
  const { expanded } = useSidebar();

  return (
    <aside
      className={cn(
        "h-screen",
        expanded ? "w-64" : "w-16",
        "bg-card border-r border-border transition-all duration-300 ease-in-out",
        className
      )}
      {...props}
    />
  );
};

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

export function SidebarNav() {
  const { pathname } = useLocation();
  const { expanded } = useSidebar();
  const { userRole } = useAuth();
  const isAdmin = userRole === "admin";

  const routes = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/",
    },
    {
      icon: LayoutGrid,
      label: "Projects",
      href: "/projects",
    },
    {
      icon: Layers,
      label: "Panels",
      href: "/panels",
    },
    {
      icon: Users,
      label: "Users",
      href: "/users",
    },
    // Only show User Management to admins
    ...(isAdmin
      ? [
          {
            icon: UserCog,
            label: "User Management",
            href: "/user-management",
          },
        ]
      : []),
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
    },
  ];

  return (
    <div className="flex flex-col space-y-1">
      {routes.map((route) => (
        <SidebarNavItem
          key={route.href}
          href={route.href}
          active={
            (pathname === route.href) ||
            (pathname?.startsWith(route.href + "/"))
          }
          expanded={expanded}
        >
          <route.icon className="h-4 w-4" />
          <span>{route.label}</span>
        </SidebarNavItem>
      ))}
    </div>
  );
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLElement> {}

export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return (
    <div
      className={cn(
        "mt-auto flex items-center justify-center py-4",
        className
      )}
      {...props}
    />
  )
}
