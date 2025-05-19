
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectStatus } from "@/types";
import { FileX, Search, Plus } from "lucide-react";
import AddProjectDialog from "@/components/AddProjectDialog";
import ProjectImport from "@/components/projects/ProjectImport";

const Projects: React.FC = () => {
  const { projects, panels, setSelectedProject } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);

  // Filter projects
  const filteredProjects = projects.filter(project => {
    // Apply search filter - ensure ID is converted to string for comparison
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(project.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => String(p.id) === String(projectId));
    if (project) {
      setSelectedProject(project);
      navigate(`/project/${projectId}`);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
        <div className="flex gap-2">
          <ProjectImport onImportComplete={() => {}} />
          <Button 
            className="bg-construction-blue hover:bg-construction-blue-dark"
            onClick={() => setIsAddProjectDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            className={statusFilter === "all" ? "bg-construction-blue hover:bg-construction-blue-dark" : ""}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === "active" ? "default" : "outline"}
            onClick={() => setStatusFilter("active")}
            className={statusFilter === "active" ? "bg-construction-blue hover:bg-construction-blue-dark" : ""}
          >
            Active
          </Button>
          <Button 
            variant={statusFilter === "completed" ? "default" : "outline"}
            onClick={() => setStatusFilter("completed")}
            className={statusFilter === "completed" ? "bg-construction-blue hover:bg-construction-blue-dark" : ""}
          >
            Completed
          </Button>
          <Button 
            variant={statusFilter === "on-hold" ? "default" : "outline"}
            onClick={() => setStatusFilter("on-hold")}
            className={statusFilter === "on-hold" ? "bg-construction-blue hover:bg-construction-blue-dark" : ""}
          >
            On Hold
          </Button>
        </div>
      </div>

      {/* Projects grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const projectPanels = panels.filter(panel => panel.projectId === project.id);
            
            return (
              <Card 
                key={project.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleProjectSelect(project.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="text-sm text-gray-500">{project.id}</div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">Location:</div>
                      <div>{project.location}</div>
                      
                      <div className="text-gray-500">Client:</div>
                      <div>{project.clientName}</div>
                      
                      <div className="text-gray-500">Start Date:</div>
                      <div>{project.startDate}</div>
                      
                      {project.endDate && (
                        <>
                          <div className="text-gray-500">End Date:</div>
                          <div>{project.endDate}</div>
                        </>
                      )}
                      
                      {project.estimated !== null && project.estimated !== undefined && (
                        <>
                          <div className="text-gray-500">Estimated Panels:</div>
                          <div>{project.estimated}</div>
                        </>
                      )}
                    </div>
                    
                    <div className="border-t border-gray-100 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Panels:</div>
                        <div className="text-lg font-semibold">{projectPanels.length}</div>
                      </div>
                      
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          Manufactured: {projectPanels.filter(p => p.status === 'manufactured').length}
                        </div>
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          Installed: {projectPanels.filter(p => p.status === 'installed').length}
                        </div>
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          Inspected: {projectPanels.filter(p => p.status === 'inspected').length}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <FileX className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500 max-w-md mb-6">
              {searchTerm 
                ? `We couldn't find any projects matching "${searchTerm}"`
                : `There are no ${statusFilter !== 'all' ? statusFilter : ''} projects to display`}
            </p>
            <Button 
              className="bg-construction-blue hover:bg-construction-blue-dark"
              onClick={() => setIsAddProjectDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Project
            </Button>
          </div>
        </Card>
      )}
      
      {/* Add Project Dialog */}
      <AddProjectDialog 
        isOpen={isAddProjectDialogOpen} 
        onClose={() => setIsAddProjectDialogOpen(false)} 
      />
    </div>
  );
};

export default Projects;
