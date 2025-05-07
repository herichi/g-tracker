
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { Panel, Project, Building } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { FileText, Printer, Download, QrCode, Table as TableIcon } from "lucide-react";
import * as XLSX from 'xlsx';

const Reports: React.FC = () => {
  const { projects, buildings, panels } = useAppContext();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [panelsWithQR, setPanelsWithQR] = useState<Panel[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const filteredBuildings = selectedProject 
    ? buildings.filter(b => b.projectId === selectedProject)
    : [];
    
  const getProject = (projectId: string): Project | undefined => {
    return projects.find(p => p.id === projectId);
  };
  
  const getBuilding = (buildingId: string): Building | undefined => {
    return buildings.find(b => b.id === buildingId);
  };
  
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
    const matchesProject = selectedProject ? panel.projectId === selectedProject : true;
    const matchesBuilding = selectedBuilding ? panel.buildingId === selectedBuilding : true;
    const matchesSearch = searchTerm 
      ? panel.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        panel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        panel.type.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesProject && matchesBuilding && matchesSearch;
  });
  
  const exportToExcel = () => {
    try {
      const exportData = filteredPanels.map(panel => {
        const project = getProject(panel.projectId);
        const building = panel.buildingId ? getBuilding(panel.buildingId) : undefined;
        
        return {
          "Project Name": project?.name || "N/A",
          "Building": building?.name || "N/A",
          "Panel Serial Number": panel.serialNumber,
          "Panel Name": panel.name || "N/A",
          "Panel Type": panel.type,
          "Panel Tag": panel.panelTag || "N/A",
          "Status": panel.status,
          "QR Code URL": panel.qrCodeImage || "N/A",
        };
      });
      
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Panels QR Codes");
      
      // Define column widths
      const columnWidths = [
        { wch: 20 }, // Project Name
        { wch: 15 }, // Building
        { wch: 20 }, // Panel Serial Number
        { wch: 20 }, // Panel Name
        { wch: 15 }, // Panel Type
        { wch: 15 }, // Panel Tag
        { wch: 15 }, // Status
        { wch: 50 }, // QR Code URL
      ];
      
      worksheet["!cols"] = columnWidths;
      
      // Generate the Excel file
      XLSX.writeFile(workbook, "Panels_QR_Codes_Report.xlsx");
      
      toast({
        title: "Export Successful",
        description: `Exported ${exportData.length} panel records to Excel`,
      });
    } catch (err: any) {
      console.error("Error exporting to Excel:", err);
      toast({
        title: "Export Failed",
        description: `Failed to export data: ${err.message}`,
        variant: "destructive"
      });
    }
  };
  
  const generatePrintView = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Print Failed",
        description: "Could not open print window. Please check your browser settings.",
        variant: "destructive"
      });
      return;
    }
    
    // Generate HTML content for the print window
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Panels QR Codes Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .panels-container { display: flex; flex-wrap: wrap; }
          .panel-card { 
            border: 1px solid #ddd; 
            margin: 10px; 
            padding: 15px; 
            width: 300px; 
            page-break-inside: avoid;
          }
          .panel-info { margin-bottom: 10px; }
          .panel-info div { margin-bottom: 5px; }
          .qr-code { text-align: center; }
          .qr-code img { width: 150px; height: 150px; }
          @media print {
            .panel-card { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Panels QR Codes Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="panels-container">
    `;
    
    // Add each panel card to the HTML content
    filteredPanels.forEach(panel => {
      const project = getProject(panel.projectId);
      const building = panel.buildingId ? getBuilding(panel.buildingId) : undefined;
      
      htmlContent += `
        <div class="panel-card">
          <div class="panel-info">
            <div><strong>Project:</strong> ${project?.name || "N/A"}</div>
            <div><strong>Building:</strong> ${building?.name || "N/A"}</div>
            <div><strong>Serial Number:</strong> ${panel.serialNumber}</div>
            <div><strong>Name:</strong> ${panel.name || "N/A"}</div>
            <div><strong>Type:</strong> ${panel.type}</div>
            ${panel.panelTag ? `<div><strong>Panel Tag:</strong> ${panel.panelTag}</div>` : ''}
          </div>
          <div class="qr-code">
            ${panel.qrCodeImage ? 
              `<img src="${panel.qrCodeImage}" alt="QR Code for ${panel.serialNumber}" />` : 
              '<div style="width: 150px; height: 150px; background: #eee; display: flex; justify-content: center; align-items: center;">No QR Code</div>'
            }
          </div>
        </div>
      `;
    });
    
    // Close the HTML content
    htmlContent += `
        </div>
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;
    
    // Write to the print window
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <TabsList>
                  <TabsTrigger value="table" className="flex items-center">
                    <TableIcon className="mr-2 h-4 w-4" />
                    Table View
                  </TabsTrigger>
                  <TabsTrigger value="cards" className="flex items-center">
                    <QrCode className="mr-2 h-4 w-4" />
                    QR Card View
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={exportToExcel}
                  className="flex items-center"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export to Excel
                </Button>
                <Button 
                  onClick={generatePrintView} 
                  variant="outline"
                  className="flex items-center"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print View
                </Button>
                <Button 
                  onClick={handleRefreshQRCodes} 
                  variant="outline"
                  disabled={loading}
                  className="flex items-center"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  {loading ? "Refreshing..." : "Refresh QR Codes"}
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input 
                  placeholder="Search panels..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Projects</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select 
                  value={selectedBuilding} 
                  onValueChange={setSelectedBuilding}
                  disabled={!selectedProject || filteredBuildings.length === 0}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Buildings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Buildings</SelectItem>
                    {filteredBuildings.map(building => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="table" className="space-y-4">
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
            </TabsContent>
            
            <TabsContent value="cards">
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
