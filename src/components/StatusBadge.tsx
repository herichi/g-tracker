
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
    // Panel statuses from workflow
    if (status === "issued") return "status-badge-info";
    if (status === "held") return "status-badge-warning";
    if (status === "produced") return "status-badge-info";
    if (status === "prepared") return "status-badge-pending";
    if (status === "delivered") return "status-badge-pending";
    if (status === "returned") return "status-badge-warning";
    if (status === "rejected_material") return "status-badge-error";
    if (status === "approved") return "status-badge-success";
    if (status === "installed") return "status-badge-warning";
    if (status === "checked") return "status-badge-info";
    if (status === "approved_final") return "status-badge-success";
    
    // Original statuses
    if (status === "manufactured") return "status-badge-info";
    if (status === "inspected") return "status-badge-success";
    if (status === "rejected") return "status-badge-error";
    
    // Project statuses
    if (status === "active") return "status-badge-success";
    if (status === "on-hold") return "status-badge-warning";
    if (status === "completed") return "status-badge-info";
    
    return "status-badge-info";
  };
  
  const getStatusLabel = () => {
    // Convert underscores to spaces and capitalize each word
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
