
import React from "react";
import { cn } from "@/lib/utils";
import { PanelStatus, ProjectStatus } from "@/types";

interface StatusBadgeProps {
  status: PanelStatus | ProjectStatus;
  pulse?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, pulse = false, className }) => {
  const getStatusClass = () => {
    // Panel statuses
    if (status === "manufactured") return "status-badge-info";
    if (status === "delivered") return "status-badge-pending";
    if (status === "installed") return "status-badge-warning";
    if (status === "inspected") return "status-badge-success";
    if (status === "rejected") return "status-badge-error";
    
    // Project statuses
    if (status === "active") return "status-badge-success";
    if (status === "on-hold") return "status-badge-warning";
    if (status === "completed") return "status-badge-info";
    
    return "status-badge-info";
  };
  
  const getStatusLabel = () => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, " ");
  };

  return (
    <span 
      className={cn(
        "status-badge", 
        getStatusClass(), 
        pulse && "animate-status-pulse",
        className
      )}
    >
      {getStatusLabel()}
    </span>
  );
};

export default StatusBadge;
