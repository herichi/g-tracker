
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
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

// Define the item structure based on the database
interface DatabaseItem {
  id: string;
  project_id: string;
  name: string;
  type: string;
  status: string;
  date: string;
  issue_transmittal_no: string;
  dwg_no: string;
  description: string;
  tag: string;
  unit_qty: number | null;
  ifp_qty_nos: number;
  ifp_qty: number | null;
  draftman: string;
  checked_by: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Transform database item to panel-like structure for compatibility
interface TransformedPanel {
  id: string;
  projectId: string;
  buildingId?: string;
  serialNumber: string;
  name: string;
  type: string;
  status: any;
  location?: string;
  dimensions: {
    width: number;
    height: number;
    thickness: number;
  };
  weight: number;
  manufacturedDate: string;
  deliveredDate?: string;
  installedDate?: string;
  inspectedDate?: string;
  date?: string;
  issueTransmittalNo?: string;
  dwgNo?: string;
  description?: string;
  panelTag?: string;
  unitQty?: number;
  unitQtyType?: 'sqm' | 'lm';
  ifpQtyNos?: number;
  ifpQtyMeasurement?: number;
  draftman?: string;
  checkedBy?: string;
  notes?: string;
  statusUpdate?: string;
  qrCode?: string;
  qrCodeImage?: string;
  groupIds?: string[];
  statusHistory?: any[];
}

const Reports: React.FC = () => {
  const { projects, buildings } = useAppContext();
  const [selectedProject, setSelectedProject] = useState<string>("all-projects");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all-buildings");
  const [loading, setLoading] = useState<boolean>(false);
  const [panelsWithQR, setPanelsWithQR] = useState<TransformedPanel[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const filteredBuildings = selectedProject && selectedProject !== "all-projects"
    ? buildings.filter(b => b.projectId === selectedProject)
    : [];
    
  const { getProject, getBuilding, exportToExcel, generatePrintView } = 
    useReportFunctions(projects, buildings, panelsWithQR);
  
  const handleRefreshQRCodes = async () => {
    setLoading(true);
    try {
      // Fetch items from Supabase
      const { data, error } = await supabase
        .from('panels')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      if (data) {
        // Transform the database items to match the expected panel structure
        const transformedData: TransformedPanel[] = data.map((item: DatabaseItem) => ({
          id: item.id,
          projectId: item.project_id,
          buildingId: undefined, // Items don't have building association
          serialNumber: item.name, // Use name as serial number
          name: item.name,
          type: item.type,
          status: item.status as any,
          dimensions: {
            width: 100, // Default values since items don't have dimensions
            height: 200,
            thickness: 10
          },
          weight: 50, // Default weight
          manufacturedDate: item.date,
          date: item.date,
          issueTransmittalNo: item.issue_transmittal_no,
          dwgNo: item.dwg_no,
          description: item.description,
          panelTag: item.tag,
          unitQty: item.unit_qty || undefined,
          ifpQtyNos: item.ifp_qty_nos,
          ifpQtyMeasurement: item.ifp_qty || undefined,
          draftman: item.draftman,
          checkedBy: item.checked_by || undefined,
          notes: item.notes || undefined,
          qrCodeImage: undefined // Items don't have QR codes yet
        }));
        
        setPanelsWithQR(transformedData);
      }
    } catch (err: any) {
      console.error("Error fetching items:", err);
      toast({
        title: "Error",
        description: `Failed to refresh data: ${err.message}`,
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
        <h2 className="text-3xl font-bold tracking-tight">Item Reports</h2>
        <p className="text-muted-foreground">
          Generate and export reports with item data for easy tracking and identification
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Item Reports
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
