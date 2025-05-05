
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
import { FileX, Search, Plus, Edit, Filter } from "lucide-react";

const Panels: React.FC = () => {
  const { projects, panels } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PanelStatus | "all">("all");
  const [projectFilter, setProjectFilter] = useState<string | "all">("all");

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
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Panels</h1>
        <Button className="bg-construction-blue hover:bg-construction-blue-dark">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <SelectItem value="manufactured">Manufactured</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="installed">Installed</SelectItem>
                <SelectItem value="inspected">Inspected</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={projectFilter} 
              onValueChange={setProjectFilter}
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
          </div>
        </CardContent>
      </Card>

      {/* Panels table */}
      <Card>
        <CardContent className="p-0">
          {filteredPanels.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPanels.map((panel) => {
                    const project = projects.find(p => p.id === panel.projectId);
                    
                    return (
                      <tr key={panel.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {panel.serialNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {panel.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button 
                            variant="link" 
                            onClick={() => navigate(`/project/${panel.projectId}`)}
                            className="p-0 h-auto text-construction-blue"
                          >
                            {project?.name || 'Unknown Project'}
                          </Button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={panel.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {panel.dimensions.width} × {panel.dimensions.height} × {panel.dimensions.thickness} mm
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {panel.weight} kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => navigate(`/panel/${panel.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
