
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, Layers, MapPin, Calendar, User, 
  Edit, Trash2, ArrowLeft, Plus, BarChart 
} from "lucide-react";
import { Panel } from "@/types";

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, panels, deleteProject } = useAppContext();
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  const isProjectManager = userRole === 'project_manager';
  
  const project = projects.find(p => p.id === projectId);
  const projectPanels = panels.filter(panel => panel.projectId === projectId);
  
  if (!project) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Project Not Found</h2>
            <p className="mb-6">The project you're looking for does not exist or has been removed.</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/projects')}
              className="mr-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleDeleteProject = () => {
    if (window.confirm(`Are you sure you want to delete project ${project.name}?`)) {
      deleteProject(project.id);
      navigate('/projects');
    }
  };
  
  const getPanelsByStatus = (status: string) => {
    return projectPanels.filter(panel => panel.status === status);
  };
  
  const getPanelStatusData = () => {
    return [
      { status: 'manufactured', count: getPanelsByStatus('manufactured').length },
      { status: 'delivered', count: getPanelsByStatus('delivered').length },
      { status: 'installed', count: getPanelsByStatus('installed').length },
      { status: 'inspected', count: getPanelsByStatus('inspected').length },
      { status: 'rejected', count: getPanelsByStatus('rejected').length }
    ];
  };
  
  const renderPanelList = (panels: Panel[]) => {
    if (panels.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No panels found in this category</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {panels.map((panel) => (
              <tr key={panel.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{panel.serialNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{panel.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={panel.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {panel.dimensions.width} × {panel.dimensions.height} × {panel.dimensions.thickness} mm
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{panel.weight} kg</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 mr-1"
                    onClick={() => navigate(`/panel/${panel.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      {/* Header with navigation and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/projects')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <StatusBadge status={project.status} className="ml-4" />
        </div>
        
        <div className="flex gap-2">
          {(isAdmin || isProjectManager) && (
            <Button 
              variant="outline"
              className="text-construction-blue border-construction-blue"
            >
              <Edit className="mr-2 h-4 w-4" /> Edit Project
            </Button>
          )}
          {isAdmin && (
            <Button 
              variant="destructive"
              onClick={handleDeleteProject}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </div>
      
      {/* Project details card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex">
                <Building className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Project Name</p>
                  <p className="font-medium">{project.name}</p>
                </div>
              </div>
              
              <div className="flex">
                <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{project.location}</p>
                </div>
              </div>
              
              <div className="flex">
                <User className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-medium">{project.clientName}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex">
                <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{project.startDate}</p>
                </div>
              </div>
              
              {project.endDate && (
                <div className="flex">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">{project.endDate}</p>
                  </div>
                </div>
              )}
              
              <div className="flex">
                <Layers className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Total Panels</p>
                  <p className="font-medium">{projectPanels.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          {project.description && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p>{project.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Panel status overview */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Panel Status Overview</CardTitle>
            {(isAdmin || isProjectManager) && (
              <Button className="bg-construction-blue hover:bg-construction-blue-dark">
                <Plus className="mr-2 h-4 w-4" /> Add Panel
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {getPanelStatusData().map((item) => (
              <div key={item.status} className="stat-card">
                <div className="text-xs text-gray-500 uppercase">{item.status}</div>
                <div className="text-2xl font-bold mt-1">{item.count}</div>
                <div className="text-xs mt-1">
                  {item.count > 0 
                    ? `${Math.round((item.count / projectPanels.length) * 100)}% of total`
                    : 'No panels'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Panel management with tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Layers className="h-5 w-5 mr-2" /> Panels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Panels</TabsTrigger>
              <TabsTrigger value="manufactured">Manufactured</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="installed">Installed</TabsTrigger>
              <TabsTrigger value="inspected">Inspected</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {renderPanelList(projectPanels)}
            </TabsContent>
            
            <TabsContent value="manufactured">
              {renderPanelList(getPanelsByStatus('manufactured'))}
            </TabsContent>
            
            <TabsContent value="delivered">
              {renderPanelList(getPanelsByStatus('delivered'))}
            </TabsContent>
            
            <TabsContent value="installed">
              {renderPanelList(getPanelsByStatus('installed'))}
            </TabsContent>
            
            <TabsContent value="inspected">
              {renderPanelList(getPanelsByStatus('inspected'))}
            </TabsContent>
            
            <TabsContent value="rejected">
              {renderPanelList(getPanelsByStatus('rejected'))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetail;
