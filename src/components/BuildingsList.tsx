
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Building } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building as BuildingIcon, PanelLeft, Pencil, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface BuildingsListProps {
  projectId: string;
}

const BuildingsList: React.FC<BuildingsListProps> = ({ projectId }) => {
  const { buildings, addBuilding, updateBuilding, deleteBuilding, getProjectBuildings } = useAppContext();
  const navigate = useNavigate();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newBuilding, setNewBuilding] = useState<Partial<Building>>({
    name: "",
    floors: 1,
    description: ""
  });
  const [currentBuilding, setCurrentBuilding] = useState<Building | null>(null);
  
  const projectBuildings = getProjectBuildings(projectId);
  
  const handleAddBuilding = () => {
    const building: Building = {
      id: uuidv4(),
      projectId,
      name: newBuilding.name || "New Building",
      floors: newBuilding.floors || 1,
      description: newBuilding.description
    };
    
    addBuilding(building);
    setNewBuilding({
      name: "",
      floors: 1,
      description: ""
    });
    setIsAddDialogOpen(false);
  };
  
  const handleEditBuilding = () => {
    if (currentBuilding) {
      updateBuilding(currentBuilding);
      setCurrentBuilding(null);
      setIsEditDialogOpen(false);
    }
  };
  
  const handleDeleteBuilding = (buildingId: string) => {
    if (confirm("Are you sure you want to delete this building?")) {
      deleteBuilding(buildingId);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">
          <BuildingIcon className="h-5 w-5 inline mr-2" />
          Buildings
        </CardTitle>
        <Button 
          size="sm" 
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add Building
        </Button>
      </CardHeader>
      <CardContent>
        {projectBuildings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Floors</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectBuildings.map((building) => (
                <TableRow key={building.id}>
                  <TableCell className="font-medium">
                    <Button 
                      variant="link" 
                      className="p-0 h-auto" 
                      onClick={() => navigate(`/building/${building.id}`)}
                    >
                      {building.name}
                    </Button>
                  </TableCell>
                  <TableCell>{building.floors}</TableCell>
                  <TableCell>{building.description || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setCurrentBuilding(building);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteBuilding(building.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/building/${building.id}`)}
                      >
                        <PanelLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No buildings created yet for this project. Add a building to get started.
          </div>
        )}
      </CardContent>
      
      {/* Add Building Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Building</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Building Name</Label>
              <Input
                id="name"
                value={newBuilding.name}
                onChange={(e) => setNewBuilding({...newBuilding, name: e.target.value})}
                placeholder="Enter building name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floors">Number of Floors</Label>
              <Input
                id="floors"
                type="number"
                value={newBuilding.floors}
                onChange={(e) => setNewBuilding({...newBuilding, floors: parseInt(e.target.value) || 1})}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newBuilding.description}
                onChange={(e) => setNewBuilding({...newBuilding, description: e.target.value})}
                placeholder="Enter building description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddBuilding}>Add Building</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Building Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Building</DialogTitle>
          </DialogHeader>
          {currentBuilding && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Building Name</Label>
                <Input
                  id="edit-name"
                  value={currentBuilding.name}
                  onChange={(e) => setCurrentBuilding({...currentBuilding, name: e.target.value})}
                  placeholder="Enter building name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-floors">Number of Floors</Label>
                <Input
                  id="edit-floors"
                  type="number"
                  value={currentBuilding.floors}
                  onChange={(e) => setCurrentBuilding({...currentBuilding, floors: parseInt(e.target.value) || 1})}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={currentBuilding.description || ''}
                  onChange={(e) => setCurrentBuilding({...currentBuilding, description: e.target.value})}
                  placeholder="Enter building description"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditBuilding}>Update Building</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default BuildingsList;
