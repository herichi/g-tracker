
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { Panel } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Import our new components
import PanelQrTable from "@/components/reports/PanelQrTable";
import PanelQrCards from "@/components/reports/PanelQrCards";
import PanelFilterBar from "@/components/reports/PanelFilterBar";
import ReportActions from "@/components/reports/ReportActions";
import useReportFunctions from "@/hooks/useReportFunctions";

const Reports: React.FC = () => {
  const { projects, buildings, panels } = useAppContext();
  const [selectedProject, setSelectedProject] = useState<string>("all-projects");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all-buildings");
  const [loading, setLoading] = useState<boolean>(false);
  const [panelsWithQR, setPanelsWithQR] = useState<Panel[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const filteredBuildings = selectedProject && selectedProject !== "all-projects"
    ? buildings.filter(b => b.projectId === selectedProject)
    : [];
    
  const { getProject, getBuilding, exportToExcel, generatePrintView } = 
    useReportFunctions(projects, buildings, panelsWithQR);
  
  const handleRefreshQRCodes = async () => {
    setLoading(true);
    try {
      // Fetch panels with QR codes from Supabase
      const { data, error } = await supabase
        .from('panels')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      if (data) {
        // Transform the database columns to match our Panel type
        const panelData = data.map(panel => ({
          id: panel.id,
          projectId: panel.project_id,
          buildingId: panel.building_id,
          serialNumber: panel.serial_number,
          name: panel.name,
          type: panel.type,
          status: panel.status as any,
          dimensions: {
            width: panel.width,
            height: panel.height,
            thickness: panel.thickness
          },
          weight: panel.weight,
          manufacturedDate: panel.manufactured_date,
          qrCodeImage: panel.qr_code_url
        })) as Panel[];
        
        setPanelsWithQR(panelData);
      }
    } catch (err: any) {
      console.error("Error fetching panels with QR codes:", err);
      toast({
        title: "Error",
        description: `Failed to refresh QR codes: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    handleRefreshQRCodes();
  }, []);
  
  const filteredPanels = panelsWithQR.filter(panel => {
    const matchesProject = !selectedProject || selectedProject === "all-projects" ? true : panel.projectId === selectedProject;
    const matchesBuilding = !selectedBuilding || selectedBuilding === "all-buildings" ? true : panel.buildingId === selectedBuilding;
    const matchesSearch = searchTerm 
      ? panel.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        panel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        panel.type.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesProject && matchesBuilding && matchesSearch;
  });
  
  const handleExportToExcel = () => {
    exportToExcel(filteredPanels);
  };
  
  const handlePrintView = () => {
    generatePrintView(filteredPanels);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Panel Reports</h2>
        <p className="text-muted-foreground">
          Generate and export reports with panel QR codes for easy tracking and identification
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Panel QR Code Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="space-y-4">
            <ReportActions
              loading={loading}
              onExportToExcel={handleExportToExcel}
              onPrintView={handlePrintView}
              onRefreshQRCodes={handleRefreshQRCodes}
            />
            
            <PanelFilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              selectedBuilding={selectedBuilding}
              setSelectedBuilding={setSelectedBuilding}
              projects={projects}
              filteredBuildings={filteredBuildings}
            />
            
            <TabsContent value="table" className="space-y-4">
              <PanelQrTable
                loading={loading}
                filteredPanels={filteredPanels}
                panelsWithQR={panelsWithQR}
                getProject={getProject}
                getBuilding={getBuilding}
              />
            </TabsContent>
            
            <TabsContent value="cards">
              <PanelQrCards
                loading={loading}
                filteredPanels={filteredPanels}
                panelsWithQR={panelsWithQR}
                getProject={getProject}
                getBuilding={getBuilding}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
