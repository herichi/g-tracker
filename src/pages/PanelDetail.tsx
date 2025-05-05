
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Building, Box, Calendar, 
  Ruler, Scale, Edit, Trash2, Clipboard
} from "lucide-react";

const PanelDetail: React.FC = () => {
  const { panelId } = useParams<{ panelId: string }>();
  const navigate = useNavigate();
  const { projects, panels, deletePanel } = useAppContext();
  
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
                    {panel.status === 'inspected' ? 'Inspected' : 'Rejected'}
                  </h3>
                  <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                    {panel.inspectedDate}
                  </time>
                </li>
              )}
            </ol>
            
            {panel.status !== 'rejected' && panel.status !== 'inspected' && (
              <div className="mt-6 text-center">
                <Button className="bg-construction-blue hover:bg-construction-blue-dark">
                  Update Status
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PanelDetail;
