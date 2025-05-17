
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { PanelStatus, UserRole } from "@/types";
import { toast } from "@/components/ui/use-toast";

// Import refactored components
import PanelNotFound from "@/components/panels/PanelNotFound";
import PanelHeader from "@/components/panels/PanelHeader";
import PanelQrDialog from "@/components/panels/PanelQrDialog";
import PanelDetails from "@/components/panels/PanelDetails";
import PanelStatusCard from "@/components/panels/PanelStatusCard";

const PanelDetail: React.FC = () => {
  const { panelId } = useParams<{ panelId: string }>();
  const navigate = useNavigate();
  const { projects, panels, deletePanel, updatePanel } = useAppContext();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  
  const panel = panels.find(p => p.id === panelId);
  const project = panel ? projects.find(p => p.id === panel.projectId) : null;
  
  if (!panel || !project) {
    return <PanelNotFound />;
  }
  
  const handleDeletePanel = () => {
    if (window.confirm(`Are you sure you want to delete panel ${panel.serialNumber}?`)) {
      deletePanel(panel.id);
      navigate('/panels');
    }
  };

  const handleStatusUpdate = (newStatus: PanelStatus, selectedRole: UserRole) => {
    const updatedPanel = { ...panel, status: newStatus };
    
    // Update dates based on status
    const now = new Date().toISOString().split('T')[0];
    
    if ((newStatus === 'delivered' || newStatus === 'proceed_delivery') && !updatedPanel.deliveredDate) {
      updatedPanel.deliveredDate = now;
    }
    
    if (newStatus === 'installed' && !updatedPanel.installedDate) {
      updatedPanel.installedDate = now;
    }
    
    if ((newStatus === 'inspected' || newStatus === 'rejected_material' || 
         newStatus === 'checked' || newStatus === 'approved_material' || 
         newStatus === 'approved_final') && !updatedPanel.inspectedDate) {
      updatedPanel.inspectedDate = now;
    }
    
    // Add to status history if it exists
    if (updatedPanel.statusHistory) {
      updatedPanel.statusHistory.push({
        status: newStatus,
        date: now,
        updatedBy: getRoleNameForDisplay(selectedRole)
      });
    } else {
      updatedPanel.statusHistory = [{
        status: newStatus,
        date: now,
        updatedBy: getRoleNameForDisplay(selectedRole)
      }];
    }
    
    updatePanel(updatedPanel);
    
    toast({
      title: "Status Updated",
      description: `Panel ${panel.serialNumber} status has been updated to ${newStatus.replace('_', ' ')}`
    });
  };

  // Generate QR code data (in a real app, this would be a proper QR code data)
  const qrCodeData = panel.qrCode || `https://panels.dohaextraco.com/panel/${panel.id}`;

  return (
    <div>
      {/* Header with navigation and actions */}
      <PanelHeader 
        panel={panel} 
        onDelete={handleDeletePanel} 
        onShowQrCode={() => setQrDialogOpen(true)} 
      />
      
      {/* QR Code Dialog */}
      <PanelQrDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        qrCodeData={qrCodeData}
        qrCodeImage={panel.qrCodeImage}
      />
      
      {/* Panel details cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <PanelDetails panel={panel} project={project} />
        <PanelStatusCard panel={panel} onStatusUpdate={handleStatusUpdate} />
      </div>
    </div>
  );
};

// Import helper functions we still need in this file
import { getRoleNameForDisplay } from "@/types";

export default PanelDetail;
