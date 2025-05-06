
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PanelStatus } from "@/types";
import { FileX, Search, Plus, Edit, Filter, PanelLeft, Building } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Panels: React.FC = () => {
  const { projects, panels, buildings } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PanelStatus | "all">("all");
  const [projectFilter, setProjectFilter] = useState<string | "all">("all");
  const [buildingFilter, setBuildingFilter] = useState<string | "all">("all");

  // Filter panels
  const filteredPanels = panels.filter(panel => {
    // Apply search filter
    const matchesSearch = 
      panel.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      panel.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      panel.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === "all" || panel.status === statusFilter;
    
    // Apply project filter
    const matchesProject = projectFilter === "all" || panel.projectId === projectFilter;
    
    // Apply building filter
    const matchesBuilding = buildingFilter === "all" || 
      (buildingFilter === "none" && !panel.buildingId) ||
      panel.buildingId === buildingFilter;
    
    return matchesSearch && matchesStatus && matchesProject && matchesBuilding;
  });

  // Get buildings for the selected project
  const projectBuildings = projectFilter !== "all" 
    ? buildings.filter(building => building.projectId === projectFilter) 
    : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Panels</h1>
        <Button className="bg-construction-blue hover:bg-construction-blue-dark" onClick={() => navigate('/panel/new')}>
          <Plus className="mr-2 h-4 w-4" /> New Panel
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            <Filter className="h-4 w-4 inline mr-2" /> 
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search panels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value as PanelStatus | "all")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
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

            <Select 
              value={projectFilter} 
              onValueChange={(value) => {
                setProjectFilter(value);
                setBuildingFilter("all");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={buildingFilter} 
              onValueChange={setBuildingFilter}
              disabled={projectFilter === "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by building" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                <SelectItem value="none">No Building</SelectItem>
                {projectBuildings.map(building => (
                  <SelectItem key={building.id} value={building.id}>
                    {building.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setProjectFilter("all");
                setBuildingFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Panels table */}
      <Card>
        <CardContent className="p-0">
          {filteredPanels.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Building</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPanels.map((panel) => {
                  const project = projects.find(p => p.id === panel.projectId);
                  const building = panel.buildingId 
                    ? buildings.find(b => b.id === panel.buildingId) 
                    : null;
                  
                  return (
                    <TableRow key={panel.id}>
                      <TableCell className="font-medium">
                        {panel.serialNumber}
                      </TableCell>
                      <TableCell>
                        {panel.type}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="link" 
                          onClick={() => navigate(`/project/${panel.projectId}`)}
                          className="p-0 h-auto text-construction-blue"
                        >
                          {project?.name || 'Unknown Project'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {building ? (
                          <Button 
                            variant="link" 
                            onClick={() => navigate(`/building/${building.id}`)}
                            className="p-0 h-auto text-construction-blue"
                          >
                            {building.name}
                          </Button>
                        ) : (
                          <span className="text-gray-500">Not Assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={panel.status} />
                      </TableCell>
                      <TableCell>
                        {panel.dimensions.width} × {panel.dimensions.height} × {panel.dimensions.thickness} mm
                      </TableCell>
                      <TableCell>
                        {panel.weight} kg
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => navigate(`/panel/${panel.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-6 text-center">
              <div className="flex flex-col items-center justify-center py-12">
                <FileX className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No panels found</h3>
                <p className="text-gray-500 max-w-md mb-6">
                  {searchTerm 
                    ? `We couldn't find any panels matching "${searchTerm}"`
                    : `There are no panels matching the selected filters`}
                </p>
                <Button className="bg-construction-blue hover:bg-construction-blue-dark">
                  <Plus className="mr-2 h-4 w-4" /> Add New Panel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Panels;
