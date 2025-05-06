
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PanelGroups from "@/components/PanelGroups";
import { Building, PanelLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";

const BuildingDetail: React.FC = () => {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();
  const { buildings, projects, getBuildingPanels } = useAppContext();
  
  const building = buildings.find(b => b.id === buildingId);
  const project = building ? projects.find(p => p.id === building.projectId) : null;
  const buildingPanels = buildingId ? getBuildingPanels(buildingId) : [];
  
  useEffect(() => {
    if (!building) {
      navigate("/projects");
    }
  }, [building, navigate]);
  
  if (!building || !project) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              className="p-0 h-auto text-gray-500" 
              onClick={() => navigate(`/project/${project.id}`)}
            >
              {project.name}
            </Button>
            <span className="text-gray-500">/</span>
            <h1 className="text-2xl font-bold text-gray-800">{building.name}</h1>
          </div>
          <p className="text-gray-500">{building.floors} {building.floors === 1 ? 'floor' : 'floors'}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/project/${project.id}`)}
        >
          Back to Project
        </Button>
      </div>

      <Tabs defaultValue="panels">
        <TabsList>
          <TabsTrigger value="panels">
            <PanelLeft className="mr-2 h-4 w-4" />
            Panels
          </TabsTrigger>
          <TabsTrigger value="groups">
            <Building className="mr-2 h-4 w-4" />
            Panel Groups
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="panels" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Building Panels</CardTitle>
            </CardHeader>
            <CardContent>
              {buildingPanels.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dimensions</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buildingPanels.map((panel) => (
                      <TableRow key={panel.id}>
                        <TableCell className="font-medium">{panel.serialNumber}</TableCell>
                        <TableCell>{panel.type}</TableCell>
                        <TableCell>
                          <StatusBadge status={panel.status} />
                        </TableCell>
                        <TableCell>
                          {panel.dimensions.width} × {panel.dimensions.height} × {panel.dimensions.thickness} mm
                        </TableCell>
                        <TableCell>{panel.weight} kg</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => navigate(`/panel/${panel.id}`)}
                          >
                            <PanelLeft className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No panels have been assigned to this building yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="groups" className="mt-6">
          <PanelGroups projectId={project.id} buildingId={building.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BuildingDetail;
