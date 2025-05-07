
import React from "react";
import { Panel, Project, Building } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface PanelQrTableProps {
  loading: boolean;
  filteredPanels: Panel[];
  panelsWithQR: Panel[];
  getProject: (projectId: string) => Project | undefined;
  getBuilding: (buildingId: string) => Building | undefined;
}

const PanelQrTable: React.FC<PanelQrTableProps> = ({ 
  loading, 
  filteredPanels, 
  panelsWithQR,
  getProject,
  getBuilding
}) => {
  return (
    <>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Building</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Panel Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Panel Tag</TableHead>
                  <TableHead>QR Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPanels.length > 0 ? (
                  filteredPanels.map(panel => {
                    const project = getProject(panel.projectId);
                    const building = panel.buildingId ? getBuilding(panel.buildingId) : undefined;
                    
                    return (
                      <TableRow key={panel.id}>
                        <TableCell>{project?.name || "N/A"}</TableCell>
                        <TableCell>{building?.name || "N/A"}</TableCell>
                        <TableCell>{panel.serialNumber}</TableCell>
                        <TableCell>{panel.name || "N/A"}</TableCell>
                        <TableCell>{panel.type}</TableCell>
                        <TableCell>{panel.panelTag || "N/A"}</TableCell>
                        <TableCell>
                          {panel.qrCodeImage ? (
                            <div className="h-12 w-12">
                              <img 
                                src={panel.qrCodeImage} 
                                alt={`QR for ${panel.serialNumber}`}
                                className="h-full w-full object-contain"
                              />
                            </div>
                          ) : (
                            <span className="text-gray-400">No QR</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      {panelsWithQR.length === 0 ? (
                        <>No panels with QR codes found in the database</>
                      ) : (
                        <>No panels match your current filters</>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="text-sm text-gray-500">
            Showing {filteredPanels.length} of {panelsWithQR.length} panels
          </div>
        </>
      )}
    </>
  );
};

export default PanelQrTable;
