
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Building, Box, Calendar, 
  Ruler, Scale, Edit, Trash2, Clipboard, 
  QrCode, AlertTriangle, User, Camera,
  Package, Truck, Factory, ShieldCheck, Hammer,
  Search, ClipboardCheck, ClipboardX, X, Check,
  FileText
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { PanelStatus, UserRole, ROLE_STATUS_MAPPING, getRoleNameForDisplay } from "@/types";

const PanelDetail: React.FC = () => {
  const { panelId } = useParams<{ panelId: string }>();
  const navigate = useNavigate();
  const { projects, panels, deletePanel, updatePanel } = useAppContext();
  const [newStatus, setNewStatus] = useState<PanelStatus | ''>('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  
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
    setNewStatus('');
    setStatusDialogOpen(false);
    
    toast({
      title: "Status Updated",
      description: `Panel ${panel.serialNumber} status has been updated to ${newStatus.replace('_', ' ')}`
    });
  };

  // Generate QR code data (in a real app, this would be a proper QR code data)
  const qrCodeData = panel.qrCode || `https://panels.dohaextraco.com/panel/${panel.id}`;

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
      switch (panel.status) {
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
              {panel.qrCodeImage ? (
                <img src={panel.qrCodeImage} alt="Panel QR Code" className="w-full h-full object-contain" />
              ) : (
                <QrCode size={200} />
              )}
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
                
                {panel.name && (
                  <div className="flex">
                    <Box className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{panel.name}</p>
                    </div>
                  </div>
                )}
                
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
                
                {panel.date && (
                  <div className="flex">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{panel.date}</p>
                    </div>
                  </div>
                )}
                
                {panel.issueTransmittalNo && (
                  <div className="flex">
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Issue / Transmittal No</p>
                      <p className="font-medium">{panel.issueTransmittalNo}</p>
                    </div>
                  </div>
                )}
                
                {panel.dwgNo && (
                  <div className="flex">
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Drawing Number</p>
                      <p className="font-medium">{panel.dwgNo}</p>
                    </div>
                  </div>
                )}
                
                {panel.panelTag && (
                  <div className="flex">
                    <Tag className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Panel Tag</p>
                      <p className="font-medium">{panel.panelTag}</p>
                    </div>
                  </div>
                )}
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
                  <Scale className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="font-medium">{panel.weight} kg</p>
                  </div>
                </div>
                
                <div className="flex">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Manufactured Date</p>
                    <p className="font-medium">{panel.manufacturedDate}</p>
                  </div>
                </div>
                
                {panel.unitQty && (
                  <div className="flex">
                    <Scale className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Unit Qty ({panel.unitQtyType?.toUpperCase() || 'SQM/LM'})</p>
                      <p className="font-medium">{panel.unitQty}</p>
                    </div>
                  </div>
                )}
                
                {panel.ifpQtyNos !== undefined && (
                  <div className="flex">
                    <Box className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">IFP QTY (Nos)</p>
                      <p className="font-medium">{panel.ifpQtyNos}</p>
                    </div>
                  </div>
                )}
                
                {panel.ifpQtyMeasurement !== undefined && (
                  <div className="flex">
                    <Ruler className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">IFP (m²/LM)</p>
                      <p className="font-medium">{panel.ifpQtyMeasurement}</p>
                    </div>
                  </div>
                )}
                
                {panel.draftman && (
                  <div className="flex">
                    <User className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Draftman</p>
                      <p className="font-medium">{panel.draftman}</p>
                    </div>
                  </div>
                )}
                
                {panel.checkedBy && (
                  <div className="flex">
                    <User className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Checked By</p>
                      <p className="font-medium">{panel.checkedBy}</p>
                    </div>
                  </div>
                )}
                
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
            
            {(panel.description || panel.notes || panel.statusUpdate) && (
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-4">
                {panel.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                    <p>{panel.description}</p>
                  </div>
                )}
                
                {panel.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
                    <p>{panel.notes}</p>
                  </div>
                )}
                
                {panel.statusUpdate && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Status Update</p>
                    <p>{panel.statusUpdate}</p>
                  </div>
                )}
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
            <Tabs defaultValue="timeline">
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
                <TabsTrigger value="update" className="flex-1">Update Status</TabsTrigger>
              </TabsList>
              
              <TabsContent value="timeline">
                <ol className="relative border-l border-gray-200 ml-3">
                  <li className="mb-6 ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-construction-status-info rounded-full -left-3 ring-8 ring-white">
                      <Factory className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="flex items-center mb-1 text-sm font-semibold">Manufactured</h3>
                    <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                      {panel.manufacturedDate}
                    </time>
                  </li>
                  
                  {/* Display status history if available */}
                  {panel.statusHistory?.filter(history => history.status !== 'manufactured').map((history, index) => (
                    <li key={index} className="mb-6 ml-6">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-construction-status-info rounded-full -left-3 ring-8 ring-white">
                        {getStatusIcon(history.status)}
                      </span>
                      <div className="flex items-center mb-1">
                        <span className="text-sm font-semibold mr-2">
                          {history.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                        <StatusBadge status={history.status} />
                      </div>
                      <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                        {history.date}
                      </time>
                      {history.updatedBy && (
                        <p className="text-xs text-gray-500 mb-1">
                          <User className="inline h-3 w-3 mr-1" /> {history.updatedBy}
                        </p>
                      )}
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
                  {!panel.statusHistory && (
                    <>
                      {panel.deliveredDate && (
                        <li className="mb-6 ml-6">
                          <span className="absolute flex items-center justify-center w-6 h-6 bg-construction-status-pending rounded-full -left-3 ring-8 ring-white">
                            <Truck className="w-3 h-3 text-white" />
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
                            <Hammer className="w-3 h-3 text-white" />
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
                            <ShieldCheck className="w-3 h-3 text-white" />
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
                    </>
                  )}
                </ol>
              </TabsContent>
              
              <TabsContent value="update">
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
                  
                  {isTerminalState(panel.status) ? (
                    <div className="flex items-center p-4 text-amber-800 bg-amber-50 rounded-md">
                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                      <p>This panel is in a final state and cannot be updated further.</p>
                    </div>
                  ) : getAvailableStatuses().length === 0 ? (
                    <div className="flex items-center p-4 text-blue-800 bg-blue-50 rounded-md">
                      <AlertTriangle className="h-5 w-5 mr-2 text-blue-600" />
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Define Tag icon since it's not imported from lucide-react
const Tag = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </svg>
);

export default PanelDetail;
