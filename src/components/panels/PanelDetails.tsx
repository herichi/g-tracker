
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building, Box, Calendar, 
  Ruler, Scale, User, 
  FileText, Clipboard
} from "lucide-react";
import { Panel, Project } from "@/types";
import { Tag } from "./icons/Tag";

interface PanelDetailsProps {
  panel: Panel;
  project: Project;
}

const PanelDetails: React.FC<PanelDetailsProps> = ({ panel, project }) => {
  const navigate = useNavigate();
  
  return (
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
  );
};

export default PanelDetails;
