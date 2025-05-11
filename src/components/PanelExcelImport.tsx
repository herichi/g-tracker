import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Panel, PanelStatus } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { FileText, Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { formatDate, formatTimestamp } from '@/lib/utils';

interface PanelExcelImportProps {
  projectId?: string;
  buildingId?: string;
  onImportComplete?: () => void;
}

const PanelExcelImport: React.FC<PanelExcelImportProps> = ({
  projectId,
  buildingId,
  onImportComplete
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStats, setImportStats] = useState<{
    added: number;
    updated: number;
    failed: number;
    total: number;
  } | null>(null);
  const { panels, addPanel, updatePanel, projects, buildings } = useAppContext();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      setImporting(true);
      const file = e.target.files[0];
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Process the data and import panels
      processImportData(jsonData);
      
      // Reset the file input
      e.target.value = '';
    } catch (error) {
      console.error("Error importing Excel file:", error);
      toast({
        title: "Import Failed",
        description: "There was an error processing the Excel file. Please check the file format.",
        variant: "destructive"
      });
      setImporting(false);
    }
  };

  const processImportData = (data: any[]) => {
    if (!data || data.length === 0) {
      toast({
        title: "No Data Found",
        description: "No data was found in the Excel file. Please check the file and try again.",
        variant: "destructive"
      });
      setImporting(false);
      return;
    }

    let added = 0;
    let updated = 0;
    let failed = 0;

    data.forEach((row) => {
      try {
        // Only validate essential field: serial number (primary identifier for panels)
        if (!row.SerialNumber) {
          failed++;
          return;
        }

        // Find if the panel already exists by serial number
        const existingPanel = panels.find(p => p.serialNumber === row.SerialNumber);
        
        // Prepare dimension object with default values if missing
        const dimensions = {
          width: parseFloat(row.Width) || 0,
          height: parseFloat(row.Height) || 0,
          thickness: parseFloat(row.Thickness) || 0
        };

        // Handle optional fields - allow null/undefined values
        const ifpQtyNos = row.IFPQtyNos !== undefined ? parseFloat(row.IFPQtyNos) : null;
        const ifpQtyMeasurement = row.IFPQtyMeasurement !== undefined ? parseFloat(row.IFPQtyMeasurement) : null;
        
        // Handle unit quantity
        const unitQty = row.UnitQty !== undefined ? parseFloat(row.UnitQty) : null;
        const unitQtyType = row.UnitQtyType === 'sqm' || row.UnitQtyType === 'lm' 
          ? row.UnitQtyType 
          : null;

        // Validate project - keep null values if not provided
        let panelProjectId = projectId;
        if (!panelProjectId && row.ProjectName) {
          const project = projects.find(p => p.name === row.ProjectName);
          if (project) {
            panelProjectId = project.id;
          }
        }

        // Validate building - keep null values if not provided
        let panelBuildingId = buildingId;
        if (!panelBuildingId && row.BuildingName && panelProjectId) {
          const building = buildings.find(b => b.name === row.BuildingName && b.projectId === panelProjectId);
          if (building) {
            panelBuildingId = building.id;
          }
        }

        // Validate status - use default if not valid
        let status: PanelStatus = 'manufactured';
        if (row.Status && typeof row.Status === 'string') {
          const normalizedStatus = row.Status.toLowerCase().replace(/\s/g, '_');
          const validStatuses: PanelStatus[] = [
            'manufactured', 'delivered', 'installed', 'inspected', 'rejected',
            'issued', 'held', 'produced', 'prepared', 'returned',
            'rejected_material', 'approved_material', 'checked', 'approved_final',
            'cancelled', 'proceed_delivery', 'broken_site'
          ];
          
          if (validStatuses.includes(normalizedStatus as PanelStatus)) {
            status = normalizedStatus as PanelStatus;
          }
        }
        
        // Format dates - accept null values for optional dates
        const manufacturedDate = formatDate(row.ManufacturedDate) || formatDate(new Date());
        const deliveredDate = formatDate(row.DeliveredDate);
        const installedDate = formatDate(row.InstalledDate);
        const inspectedDate = formatDate(row.InspectedDate);
        const date = formatDate(row.Date);
        
        // Import dates for created_at and updated_at if available
        const createdAt = formatTimestamp(row.CreatedAt);
        const updatedAt = formatTimestamp(row.UpdatedAt);
        
        // Create panel object with properly formatted dates
        const panelData: Partial<Panel> = {
          serialNumber: row.SerialNumber,
          name: row.Name || row.SerialNumber,
          type: row.Type || 'Standard',
          status: status,
          projectId: panelProjectId || '',
          buildingId: panelBuildingId,
          dimensions: dimensions,
          weight: row.Weight !== undefined ? parseFloat(row.Weight) || 0 : 0,
          date: date,
          issueTransmittalNo: row.IssueTransmittalNo || null,
          dwgNo: row.DwgNo || null,
          description: row.Description || null,
          panelTag: row.PanelTag || null,
          unitQty: unitQty,
          unitQtyType: unitQtyType,
          ifpQtyNos: ifpQtyNos,
          ifpQtyMeasurement: ifpQtyMeasurement,
          draftman: row.Draftman || null,
          checkedBy: row.CheckedBy || null,
          notes: row.Notes || null,
          location: row.Location || null,
          manufacturedDate: manufacturedDate,
          deliveredDate: deliveredDate,
          installedDate: installedDate,
          inspectedDate: inspectedDate,
        };

        // Update existing panel or add new one
        if (existingPanel) {
          updatePanel({
            ...existingPanel,
            ...panelData,
            dimensions: {
              ...existingPanel.dimensions,
              ...panelData.dimensions
            }
          } as Panel);
          updated++;
        } else {
          addPanel({
            ...panelData,
            id: uuidv4(),
            projectId: panelProjectId || '',
            serialNumber: row.SerialNumber,
            type: row.Type || 'Standard',
            status: panelData.status || 'manufactured',
            dimensions: dimensions,
            weight: row.Weight !== undefined ? parseFloat(row.Weight) || 0 : 0,
            manufacturedDate: panelData.manufacturedDate || new Date().toISOString()
          } as Panel);
          added++;
        }
      } catch (error) {
        console.error("Error processing row:", error, row);
        failed++;
      }
    });

    // Show import results
    setImportStats({
      added,
      updated,
      failed,
      total: data.length
    });
    
    setImporting(false);
    
    if (failed > 0) {
      toast({
        title: "Import Completed with Errors",
        description: `Added ${added} panels, updated ${updated} panels. ${failed} panels failed to import.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Import Successful",
        description: `Added ${added} panels, updated ${updated} panels.`,
      });
    }

    if (onImportComplete) {
      onImportComplete();
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setImportStats(null);
  };

  const openFileSelector = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls,.csv';
    fileInput.onchange = (e) => {
      // Properly type the event by first casting to unknown then to the specific type
      const event = e as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(event);
    };
    fileInput.click();
  };

  return (
    <>
      <Button
        variant="outline"
        className="bg-white flex gap-2"
        onClick={() => setIsDialogOpen(true)}
      >
        <FileText className="h-4 w-4" /> Import Excel
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Panels from Excel</DialogTitle>
            <DialogDescription>
              Upload an Excel file with panel data. Existing panels will be updated, and new panels will be added.
            </DialogDescription>
          </DialogHeader>
          
          {importStats ? (
            <div className="py-6">
              <h3 className="text-lg font-medium">Import Results</h3>
              <div className="mt-4 space-y-3">
                <p><strong>Total rows processed:</strong> {importStats.total}</p>
                <p><strong>Panels added:</strong> {importStats.added}</p>
                <p><strong>Panels updated:</strong> {importStats.updated}</p>
                {importStats.failed > 0 && (
                  <p className="text-red-500"><strong>Failed imports:</strong> {importStats.failed}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center gap-4">
                <Button 
                  onClick={openFileSelector} 
                  className="w-full" 
                  disabled={importing}
                >
                  {importing ? (
                    <span>Importing...</span>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" /> Choose Excel file
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500">
                  Upload Excel files with columns: SerialNumber, Name, Type, Status, etc.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              {importStats ? "Close" : "Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PanelExcelImport;
