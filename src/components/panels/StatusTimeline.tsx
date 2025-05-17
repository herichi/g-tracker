
import React from "react";
import { PanelStatus } from "@/types";
import { 
  Factory, Truck, Hammer, 
  ShieldCheck, Box, AlertTriangle, 
  X, Check, Search, ClipboardCheck, 
  ClipboardX, User, Package 
} from "lucide-react";

interface TimelineItem {
  status: PanelStatus;
  date: string;
  updatedBy?: string;
  notes?: string;
  photoUrl?: string;
}

interface StatusTimelineProps {
  items: TimelineItem[];
  manufacturedDate: string;
  deliveredDate?: string;
  installedDate?: string;
  inspectedDate?: string;
  status: PanelStatus;
}

const StatusTimeline: React.FC<StatusTimelineProps> = ({
  items,
  manufacturedDate,
  deliveredDate,
  installedDate,
  inspectedDate,
  status
}) => {
  // Get status icon
  const getStatusIcon = (status: PanelStatus) => {
    switch (status) {
      case 'issued': return <Box className="w-3 h-3 text-white" />;
      case 'held': return <AlertTriangle className="w-3 h-3 text-white" />;
      case 'cancelled': return <X className="w-3 h-3 text-white" />;
      case 'produced': return <Factory className="w-3 h-3 text-white" />;
      case 'proceed_delivery': return <Package className="w-3 h-3 text-white" />;
      case 'delivered': return <Truck className="w-3 h-3 text-white" />;
      case 'broken_site': return <AlertTriangle className="w-3 h-3 text-white" />;
      case 'approved_material': return <Check className="w-3 h-3 text-white" />;
      case 'rejected_material': return <X className="w-3 h-3 text-white" />;
      case 'installed': return <Hammer className="w-3 h-3 text-white" />;
      case 'checked': return <Search className="w-3 h-3 text-white" />;
      case 'inspected': return <ShieldCheck className="w-3 h-3 text-white" />;
      case 'approved_final': return <ClipboardCheck className="w-3 h-3 text-white" />;
      case 'rejected': return <ClipboardX className="w-3 h-3 text-white" />;
      case 'manufactured': return <Factory className="w-3 h-3 text-white" />;
      default: return <Box className="w-3 h-3 text-white" />;
    }
  };
  
  return (
    <ol className="relative border-l border-gray-200 ml-3">
      <li className="mb-6 ml-6">
        <span className="absolute flex items-center justify-center w-6 h-6 bg-construction-status-info rounded-full -left-3 ring-8 ring-white">
          <Factory className="w-3 h-3 text-white" />
        </span>
        <div className="flex items-center mb-1">
          <h3 className="text-sm font-semibold mr-2">Manufactured</h3>
        </div>
        <time className="block mb-1 text-xs font-normal leading-none text-gray-400">
          {manufacturedDate}
        </time>
        <p className="text-xs text-gray-500">
          <User className="inline h-3 w-3 mr-1" /> Factory Admin
        </p>
      </li>
      
      {/* Display status history if available */}
      {items.filter(history => history.status !== 'manufactured').map((history, index) => (
        <li key={index} className="mb-6 ml-6">
          <span className="absolute flex items-center justify-center w-6 h-6 bg-construction-status-info rounded-full -left-3 ring-8 ring-white">
            {getStatusIcon(history.status)}
          </span>
          <div className="flex items-center mb-1">
            <span className="text-sm font-semibold mr-2">
              {history.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </span>
          </div>
          <time className="block mb-1 text-xs font-normal leading-none text-gray-400">
            {history.date}
          </time>
          <p className="text-xs text-gray-500 mb-1">
            <User className="inline h-3 w-3 mr-1" /> {history.updatedBy || "Unknown User"}
          </p>
          {history.notes && (
            <p className="text-xs text-gray-600 mb-1">{history.notes}</p>
          )}
          {history.photoUrl && (
            <div className="mt-2 rounded overflow-hidden w-full max-w-[150px]">
              <img src={history.photoUrl} alt={`Status update for ${history.status}`} className="w-full h-auto" />
            </div>
          )}
        </li>
      ))}
      
      {/* Default status timeline elements if no history */}
      {items.length === 0 && (
        <>
          {deliveredDate && (
            <li className="mb-6 ml-6">
              <span className="absolute flex items-center justify-center w-6 h-6 bg-construction-status-pending rounded-full -left-3 ring-8 ring-white">
                <Truck className="w-3 h-3 text-white" />
              </span>
              <div className="flex items-center mb-1">
                <h3 className="text-sm font-semibold mr-2">Delivered</h3>
              </div>
              <time className="block mb-1 text-xs font-normal leading-none text-gray-400">
                {deliveredDate}
              </time>
              <p className="text-xs text-gray-500">
                <User className="inline h-3 w-3 mr-1" /> Unknown User
              </p>
            </li>
          )}
          
          {installedDate && (
            <li className="mb-6 ml-6">
              <span className="absolute flex items-center justify-center w-6 h-6 bg-construction-status-warning rounded-full -left-3 ring-8 ring-white">
                <Hammer className="w-3 h-3 text-white" />
              </span>
              <div className="flex items-center mb-1">
                <h3 className="text-sm font-semibold mr-2">Installed</h3>
              </div>
              <time className="block mb-1 text-xs font-normal leading-none text-gray-400">
                {installedDate}
              </time>
              <p className="text-xs text-gray-500">
                <User className="inline h-3 w-3 mr-1" /> Unknown User
              </p>
            </li>
          )}
          
          {inspectedDate && (
            <li className="ml-6">
              <span className="absolute flex items-center justify-center w-6 h-6 bg-construction-status-success rounded-full -left-3 ring-8 ring-white">
                <ShieldCheck className="w-3 h-3 text-white" />
              </span>
              <div className="flex items-center mb-1">
                <h3 className="text-sm font-semibold mr-2">
                  {status === 'inspected' ? 'Inspected' : 
                   status === 'rejected' ? 'Rejected' :
                   status === 'approved_final' ? 'Approved Final' :
                   status === 'checked' ? 'Checked' : status}
                </h3>
              </div>
              <time className="block mb-1 text-xs font-normal leading-none text-gray-400">
                {inspectedDate}
              </time>
              <p className="text-xs text-gray-500">
                <User className="inline h-3 w-3 mr-1" /> Unknown User
              </p>
            </li>
          )}
        </>
      )}
    </ol>
  );
};

export default StatusTimeline;
