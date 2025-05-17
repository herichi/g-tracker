
import React, { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { PanelStatus, UserRole } from "@/types";
import { 
  AlertTriangle, User, Camera, Box, 
  Check, X, Factory, AlertCircle, Package,
  Truck, Hammer, Search, ShieldCheck,
  ClipboardCheck, ClipboardX
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRoleNameForDisplay, ROLE_STATUS_MAPPING } from "@/types";

interface StatusUpdateFormProps {
  currentStatus: PanelStatus;
  onUpdate: (newStatus: PanelStatus, role: UserRole) => void;
}

const StatusUpdateForm: React.FC<StatusUpdateFormProps> = ({ 
  currentStatus, 
  onUpdate 
}) => {
  const [newStatus, setNewStatus] = useState<PanelStatus | ''>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  
  // Get status icon
  const getStatusIcon = (status: PanelStatus) => {
    switch (status) {
      case 'issued': return <Box className="h-4 w-4" />;
      case 'held': return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      case 'produced': return <Factory className="h-4 w-4" />;
      case 'proceed_delivery': return <Package className="h-4 w-4" />;
      case 'delivered': return <Truck className="h-4 w-4" />;
      case 'broken_site': return <AlertTriangle className="h-4 w-4" />;
      case 'approved_material': return <Check className="h-4 w-4" />;
      case 'rejected_material': return <X className="h-4 w-4" />;
      case 'installed': return <Hammer className="h-4 w-4" />;
      case 'checked': return <Search className="h-4 w-4" />;
      case 'inspected': return <ShieldCheck className="h-4 w-4" />;
      case 'approved_final': return <ClipboardCheck className="h-4 w-4" />;
      case 'rejected': return <ClipboardX className="h-4 w-4" />;
      case 'manufactured': return <Factory className="h-4 w-4" />;
      default: return <Box className="h-4 w-4" />;
    }
  };

  // Define available status transitions based on current status and role
  const getAvailableStatuses = (): PanelStatus[] => {
    const roleMapping = ROLE_STATUS_MAPPING.find(mapping => mapping.role === selectedRole);
    if (!roleMapping) return [];
    
    // For admin, show next logical statuses based on workflow
    if (selectedRole === 'admin') {
      switch (currentStatus) {
        case 'issued':
          return ['held', 'produced', 'cancelled'];
        case 'held':
          return ['issued', 'produced', 'cancelled'];
        case 'produced':
          return ['proceed_delivery'];
        case 'proceed_delivery':
          return ['delivered', 'broken_site'];
        case 'delivered':
          return ['approved_material', 'rejected_material'];
        case 'approved_material':
          return ['installed'];
        case 'installed':
          return ['checked'];
        case 'checked':
          return ['inspected'];
        case 'inspected':
          return ['approved_final', 'rejected_material'];
        case 'manufactured':
          return ['issued', 'delivered'];
        default:
          return roleMapping.allowedStatuses;
      }
    }
    
    // For other roles, only show statuses allowed for that role
    return roleMapping.allowedStatuses;
  };

  // Determine if a panel is in a terminal state
  const isTerminalState = (status: PanelStatus): boolean => {
    return ['rejected_material', 'approved_final', 'cancelled', 'broken_site'].includes(status);
  };

  const handleStatusUpdate = () => {
    if (!newStatus) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive"
      });
      return;
    }

    onUpdate(newStatus, selectedRole);
    setNewStatus('');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Select your role</label>
        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_STATUS_MAPPING.map(mapping => (
              <SelectItem key={mapping.role} value={mapping.role}>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>{getRoleNameForDisplay(mapping.role)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {isTerminalState(currentStatus) ? (
        <div className="flex items-center p-4 text-amber-800 bg-amber-50 rounded-md">
          <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
          <p>This panel is in a final state and cannot be updated further.</p>
        </div>
      ) : getAvailableStatuses().length === 0 ? (
        <div className="flex items-center p-4 text-blue-800 bg-blue-50 rounded-md">
          <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
          <p>Your selected role cannot update this panel's status.</p>
        </div>
      ) : (
        <>
          <div>
            <label className="text-sm font-medium mb-1 block">Select new status</label>
            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as PanelStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableStatuses().map(status => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center">
                      {getStatusIcon(status)}
                      <span className="ml-2">
                        {status.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-2">
            <Button 
              className="w-full bg-construction-blue hover:bg-construction-blue-dark" 
              onClick={handleStatusUpdate}
              disabled={!newStatus}
            >
              Update Status
            </Button>
          </div>
          
          <div className="mt-2">
            <Button variant="outline" className="w-full" disabled>
              <Camera className="mr-2 h-4 w-4" /> Add Photo
            </Button>
            <p className="text-xs text-gray-500 mt-1 text-center">
              Photo upload coming soon in the mobile app
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default StatusUpdateForm;
