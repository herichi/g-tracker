
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { PanelGroup, Panel, PanelStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Group, Pencil, Trash2, PanelsTopLeft, Tag } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import StatusBadge from "@/components/StatusBadge";

interface PanelGroupsProps {
  projectId: string;
  buildingId?: string;
}

const PanelGroups: React.FC<PanelGroupsProps> = ({ projectId, buildingId }) => {
  const { 
    panels, 
    panelGroups, 
    addPanelGroup, 
    updatePanelGroup, 
    deletePanelGroup,
    updatePanelsStatus,
    getProjectGroups,
    getProjectPanels,
    getBuildingPanels
  } = useAppContext();
  const navigate = useNavigate();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isChangeStatusDialogOpen, setIsChangeStatusDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState<Partial<PanelGroup>>({
    name: "",
    panelIds: [],
    description: ""
  });
  const [currentGroup, setCurrentGroup] = useState<PanelGroup | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<PanelStatus>("manufactured");
  const [selectedPanels, setSelectedPanels] = useState<Record<string, boolean>>({});
  
  const projectGroups = getProjectGroups(projectId);
  const availablePanels = buildingId 
    ? getBuildingPanels(buildingId)
    : getProjectPanels(projectId);
  
  const handleAddGroup = () => {
    const selectedPanelIds = Object.entries(selectedPanels)
      .filter(([_, isSelected]) => isSelected)
      .map(([panelId]) => panelId);
    
    if (selectedPanelIds.length === 0) {
      alert("Please select at least one panel for the group.");
      return;
    }
    
    const group: PanelGroup = {
      id: uuidv4(),
      projectId,
      buildingId,
      name: newGroup.name || `Group ${projectGroups.length + 1}`,
      panelIds: selectedPanelIds,
      createdAt: new Date().toISOString(),
      description: newGroup.description
    };
    
    addPanelGroup(group);
    setNewGroup({
      name: "",
      panelIds: [],
      description: ""
    });
    setSelectedPanels({});
    setIsAddDialogOpen(false);
  };
  
  const handleEditGroup = () => {
    if (currentGroup) {
      const selectedPanelIds = Object.entries(selectedPanels)
        .filter(([_, isSelected]) => isSelected)
        .map(([panelId]) => panelId);
      
      if (selectedPanelIds.length === 0) {
        alert("Please select at least one panel for the group.");
        return;
      }
      
      const updatedGroup: PanelGroup = {
        ...currentGroup,
        name: currentGroup.name,
        panelIds: selectedPanelIds,
        description: currentGroup.description
      };
      
      updatePanelGroup(updatedGroup);
      setCurrentGroup(null);
      setSelectedPanels({});
      setIsEditDialogOpen(false);
    }
  };
  
  const handleDeleteGroup = (groupId: string) => {
    if (confirm("Are you sure you want to delete this group?")) {
      deletePanelGroup(groupId);
    }
  };
  
  const openEditDialog = (group: PanelGroup) => {
    setCurrentGroup(group);
    
    // Initialize selected panels
    const panelSelections: Record<string, boolean> = {};
    availablePanels.forEach(panel => {
      panelSelections[panel.id] = group.panelIds.includes(panel.id);
    });
    
    setSelectedPanels(panelSelections);
    setIsEditDialogOpen(true);
  };
  
  const openChangeStatusDialog = (group: PanelGroup) => {
    setCurrentGroup(group);
    setIsChangeStatusDialogOpen(true);
  };
  
  const handleChangeStatus = () => {
    if (currentGroup) {
      updatePanelsStatus(currentGroup.panelIds, selectedStatus);
      setCurrentGroup(null);
      setIsChangeStatusDialogOpen(false);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">
          <Group className="h-5 w-5 inline mr-2" />
          Panel Groups
        </CardTitle>
        <Button 
          size="sm" 
          onClick={() => setIsAddDialogOpen(true)}
        >
          Create Group
        </Button>
      </CardHeader>
      <CardContent>
        {projectGroups.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Panels</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectGroups
                .filter(group => buildingId ? group.buildingId === buildingId : true)
                .map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{group.panelIds.length} panels</TableCell>
                  <TableCell>{group.description || 'N/A'}</TableCell>
                  <TableCell>{new Date(group.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openEditDialog(group)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openChangeStatusDialog(group)}
                      >
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No panel groups created yet. Create a group to organize panels.
          </div>
        )}
      </CardContent>
      
      {/* Add Group Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Panel Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                placeholder="Enter group name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-description">Description (Optional)</Label>
              <Textarea
                id="group-description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                placeholder="Enter group description"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label className="block mb-2">Select Panels</Label>
              <div className="border rounded-md p-4 max-h-64 overflow-y-auto">
                {availablePanels.length === 0 ? (
                  <p className="text-gray-500 text-center">
                    No panels available to add to the group.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availablePanels.map((panel) => (
                      <div key={panel.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`panel-${panel.id}`}
                          checked={selectedPanels[panel.id] || false}
                          onCheckedChange={(checked) => {
                            setSelectedPanels({
                              ...selectedPanels,
                              [panel.id]: !!checked
                            });
                          }}
                        />
                        <Label htmlFor={`panel-${panel.id}`} className="flex items-center justify-between flex-1">
                          <span>{panel.serialNumber} ({panel.type})</span>
                          <StatusBadge status={panel.status} />
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddGroup}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Group Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Panel Group</DialogTitle>
          </DialogHeader>
          {currentGroup && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-group-name">Group Name</Label>
                <Input
                  id="edit-group-name"
                  value={currentGroup.name}
                  onChange={(e) => setCurrentGroup({...currentGroup, name: e.target.value})}
                  placeholder="Enter group name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-group-description">Description (Optional)</Label>
                <Textarea
                  id="edit-group-description"
                  value={currentGroup.description || ''}
                  onChange={(e) => setCurrentGroup({...currentGroup, description: e.target.value})}
                  placeholder="Enter group description"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="block mb-2">Select Panels</Label>
                <div className="border rounded-md p-4 max-h-64 overflow-y-auto">
                  {availablePanels.length === 0 ? (
                    <p className="text-gray-500 text-center">
                      No panels available to add to the group.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availablePanels.map((panel) => (
                        <div key={panel.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`edit-panel-${panel.id}`}
                            checked={selectedPanels[panel.id] || false}
                            onCheckedChange={(checked) => {
                              setSelectedPanels({
                                ...selectedPanels,
                                [panel.id]: !!checked
                              });
                            }}
                          />
                          <Label htmlFor={`edit-panel-${panel.id}`} className="flex items-center justify-between flex-1">
                            <span>{panel.serialNumber} ({panel.type})</span>
                            <StatusBadge status={panel.status} />
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditGroup}>Update Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Change Status Dialog */}
      <Dialog open={isChangeStatusDialogOpen} onOpenChange={setIsChangeStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status for Group</DialogTitle>
          </DialogHeader>
          {currentGroup && (
            <div className="space-y-4 py-4">
              <p>
                Update status for all panels in group <strong>{currentGroup.name}</strong> ({currentGroup.panelIds.length} panels)
              </p>
              <div className="space-y-2">
                <Label htmlFor="status">Select New Status</Label>
                <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as PanelStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="issued">Issued</SelectItem>
                    <SelectItem value="held">Held</SelectItem>
                    <SelectItem value="produced">Produced</SelectItem>
                    <SelectItem value="proceed_delivery">Proceed for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="approved_material">Approved Material</SelectItem>
                    <SelectItem value="rejected_material">Rejected Material</SelectItem>
                    <SelectItem value="installed">Installed</SelectItem>
                    <SelectItem value="checked">Checked</SelectItem>
                    <SelectItem value="inspected">Inspected</SelectItem>
                    <SelectItem value="approved_final">Approved Final</SelectItem>
                    <SelectItem value="broken_site">Broken at Site</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleChangeStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PanelGroups;
