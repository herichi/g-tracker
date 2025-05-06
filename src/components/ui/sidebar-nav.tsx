
import * as React from "react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

interface SidebarNavItemProps extends React.HTMLAttributes<HTMLElement> {
  href: string
  active?: boolean
  expanded?: boolean
  children: React.ReactNode
}

export function SidebarNavItem({
  className,
  href,
  active,
  expanded = true,
  children,
  ...props
}: SidebarNavItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted hover:text-foreground",
        !expanded && "justify-center px-2",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  )
}
