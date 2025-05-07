
import { useState } from "react";
import { Panel, Project, Building } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

export const useReportFunctions = (
  projects: Project[],
  buildings: Building[],
  panelsWithQR: Panel[]
) => {
  // Helper functions
  const getProject = (projectId: string): Project | undefined => {
    return projects.find(p => p.id === projectId);
  };
  
  const getBuilding = (buildingId: string): Building | undefined => {
    return buildings.find(b => b.id === buildingId);
  };
  
  const exportToExcel = (filteredPanels: Panel[]) => {
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
  
  const generatePrintView = (filteredPanels: Panel[]) => {
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

  return {
    getProject,
    getBuilding,
    exportToExcel,
    generatePrintView
  };
};

export default useReportFunctions;
