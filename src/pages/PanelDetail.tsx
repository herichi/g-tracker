
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Building, Box, Calendar, 
  Ruler, Scale, Edit, Trash2, Clipboard, 
  QrCode, AlertTriangle
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PanelStatus } from "@/types";

const PanelDetail: React.FC = () => {
  const { panelId } = useParams<{ panelId: string }>();
  const navigate = useNavigate();
  const { projects, panels, deletePanel, updatePanel } = useAppContext();
  const [newStatus, setNewStatus] = useState<PanelStatus | ''>('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  
  const panel = panels.find(p => p.id === panelId);
  const project = panel ? projects.find(p => p.id === panel.projectId) : null;
  
  if (!panel || !project) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Panel Not Found</h2>
            <p className="mb-6">The panel you're looking for does not exist or has been removed.</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/panels')}
              className="mr-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Panels
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleDeletePanel = () => {
    if (window.confirm(`Are you sure you want to delete panel ${panel.serialNumber}?`)) {
      deletePanel(panel.id);
      navigate('/panels');
    }
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

    const updatedPanel = { ...panel, status: newStatus };
    
    // Update dates based on status
    const now = new Date().toISOString().split('T')[0];
    
    if (newStatus === 'delivered' && !updatedPanel.deliveredDate) {
      updatedPanel.deliveredDate = now;
    }
    
    if (newStatus === 'installed' && !updatedPanel.installedDate) {
      updatedPanel.installedDate = now;
    }
    
    if ((newStatus === 'inspected' || newStatus === 'rejected' || 
         newStatus === 'checked' || newStatus === 'approved_final') && 
        !updatedPanel.inspectedDate) {
      updatedPanel.inspectedDate = now;
    }
    
    updatePanel(updatedPanel);
    setNewStatus('');
    setStatusDialogOpen(false);
    
    toast({
      title: "Status Updated",
      description: `Panel ${panel.serialNumber} status has been updated to ${newStatus.replace('_', ' ')}`
    });
  };

  // Generate QR code data (in a real app, this would be a proper QR code data)
  const qrCodeData = panel.qrCode || `https://panels.dohaextraco.com/panel/${panel.id}`;

  // Define available status transitions based on current status
  const getAvailableStatuses = (): PanelStatus[] => {
    switch (panel.status) {
      case 'issued':
        return ['held', 'produced'];
      case 'held':
        return ['produced'];
      case 'produced':
        return ['prepared'];
      case 'prepared':
        return ['delivered'];
      case 'delivered':
        return ['returned', 'approved'];
      case 'returned':
        return ['rejected_material'];
      case 'approved':
        return ['installed'];
      case 'installed':
        return ['checked'];
      case 'checked':
        return ['approved_final', 'rejected'];
      case 'manufactured':
        return ['delivered'];
      case 'delivered':
        return ['installed'];
      case 'installed':
        return ['inspected', 'rejected'];
      default:
        return [];
    }
  };

  return (
    <div>
      {/* Header with navigation and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/panels')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Panel {panel.serialNumber}</h1>
          <StatusBadge status={panel.status} className="ml-4" />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setQrDialogOpen(true)}
            className="text-construction-blue border-construction-blue"
          >
            <QrCode className="mr-2 h-4 w-4" /> QR Code
          </Button>
          <Button 
            variant="outline"
            className="text-construction-blue border-construction-blue"
          >
            <Edit className="mr-2 h-4 w-4" /> Edit Panel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDeletePanel}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>
      
      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Panel QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code with the Doha Extraco app to view or update this panel's status.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            <div className="w-64 h-64 bg-white flex items-center justify-center border">
              <QrCode size={200} />
              <p className="sr-only">{qrCodeData}</p>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(qrCodeData);
                toast({ 
                  title: "QR Code Link Copied", 
                  description: "Link has been copied to clipboard." 
                });
              }}
            >
              <Clipboard className="mr-2 h-4 w-4" /> Copy Link
            </Button>
            <Button 
              type="button" 
              onClick={() => setQrDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Panel details card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Panel Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex">
                  <Clipboard className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Serial Number</p>
                    <p className="font-medium">{panel.serialNumber}</p>
                  </div>
                </div>
                
                <div className="flex">
                  <Box className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{panel.type}</p>
                  </div>
                </div>
                
                <div className="flex">
                  <Building className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Project</p>
                    <p className="font-medium">
                      <Button 
                        variant="link" 
                        onClick={() => navigate(`/project/${project.id}`)}
                        className="p-0 h-auto text-construction-blue"
                      >
                        {project.name}
                      </Button>
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <Scale className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="font-medium">{panel.weight} kg</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex">
                  <Ruler className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Dimensions</p>
                    <p className="font-medium">
                      {panel.dimensions.width} × {panel.dimensions.height} × {panel.dimensions.thickness} mm
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Manufactured Date</p>
                    <p className="font-medium">{panel.manufacturedDate}</p>
                  </div>
                </div>
                
                {panel.location && (
                  <div className="flex">
                    <Building className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Current Location</p>
                      <p className="font-medium">{panel.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {panel.notes && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p>{panel.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Status timeline card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative border-l border-gray-200 ml-3">
              <li className="mb-6 ml-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-construction-status-info rounded-full -left-3 ring-8 ring-white">
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                </span>
                <h3 className="flex items-center mb-1 text-sm font-semibold">Manufactured</h3>
                <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                  {panel.manufacturedDate}
                </time>
              </li>
              
              {panel.deliveredDate && (
                <li className="mb-6 ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-construction-status-pending rounded-full -left-3 ring-8 ring-white">
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  </span>
                  <h3 className="flex items-center mb-1 text-sm font-semibold">Delivered</h3>
                  <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                    {panel.deliveredDate}
                  </time>
                </li>
              )}
              
              {panel.installedDate && (
                <li className="mb-6 ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-construction-status-warning rounded-full -left-3 ring-8 ring-white">
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  </span>
                  <h3 className="flex items-center mb-1 text-sm font-semibold">Installed</h3>
                  <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                    {panel.installedDate}
                  </time>
                </li>
              )}
              
              {panel.inspectedDate && (
                <li className="ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-construction-status-success rounded-full -left-3 ring-8 ring-white">
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  </span>
                  <h3 className="flex items-center mb-1 text-sm font-semibold">
                    {panel.status === 'inspected' ? 'Inspected' : 
                     panel.status === 'rejected' ? 'Rejected' :
                     panel.status === 'approved_final' ? 'Approved Final' :
                     panel.status === 'checked' ? 'Checked' : panel.status}
                  </h3>
                  <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                    {panel.inspectedDate}
                  </time>
                </li>
              )}
            </ol>
            
            {getAvailableStatuses().length > 0 && (
              <div className="mt-6 text-center">
                <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-construction-blue hover:bg-construction-blue-dark">
                      Update Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Panel Status</DialogTitle>
                      <DialogDescription>
                        Choose a new status for panel {panel.serialNumber}
                      </DialogDescription>
                    </DialogHeader>
                    
                    {panel.status === 'rejected' || panel.status === 'rejected_material' || panel.status === 'approved_final' ? (
                      <div className="flex items-center p-4 text-amber-800 bg-amber-50 rounded-md">
                        <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                        <p>This panel is in a final state and cannot be updated further.</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-4 py-4">
                          <Select value={newStatus} onValueChange={(value) => setNewStatus(value as PanelStatus)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableStatuses().map(status => (
                                <SelectItem key={status} value={status}>
                                  <div className="flex items-center">
                                    <StatusBadge status={status} className="mr-2" />
                                    <span>
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
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" onClick={handleStatusUpdate}>
                            Update Status
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PanelDetail;
