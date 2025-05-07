
import React from "react";
import { Panel, Project, Building } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface PanelQrCardsProps {
  loading: boolean;
  filteredPanels: Panel[];
  panelsWithQR: Panel[];
  getProject: (projectId: string) => Project | undefined;
  getBuilding: (buildingId: string) => Building | undefined;
}

const PanelQrCards: React.FC<PanelQrCardsProps> = ({ 
  loading, 
  filteredPanels, 
  panelsWithQR,
  getProject,
  getBuilding
}) => {
  return (
    <>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="border rounded-md p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredPanels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredPanels.map(panel => {
                const project = getProject(panel.projectId);
                const building = panel.buildingId ? getBuilding(panel.buildingId) : undefined;
                
                return (
                  <div key={panel.id} className="border rounded-md p-4">
                    <div className="space-y-1 mb-3">
                      <p className="text-sm font-medium">
                        {project?.name || "N/A"} {building ? `- ${building.name}` : ''}
                      </p>
                      <h3 className="font-bold">{panel.serialNumber}</h3>
                      <p className="text-sm text-gray-500">{panel.name || panel.type}</p>
                      {panel.panelTag && (
                        <p className="text-xs text-gray-500">Tag: {panel.panelTag}</p>
                      )}
                    </div>
                    <div className="flex justify-center">
                      {panel.qrCodeImage ? (
                        <img 
                          src={panel.qrCodeImage} 
                          alt={`QR for ${panel.serialNumber}`}
                          className="h-32 object-contain"
                        />
                      ) : (
                        <div className="h-32 w-32 bg-gray-100 flex items-center justify-center text-gray-400">
                          No QR Code
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              {panelsWithQR.length === 0 ? (
                <>No panels with QR codes found in the database</>
              ) : (
                <>No panels match your current filters</>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default PanelQrCards;
