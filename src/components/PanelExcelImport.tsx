
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
import { supabase } from '@/integrations/supabase/client';

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

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
    
    return data;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      setImporting(true);
      const file = e.target.files[0];
      let jsonData: any[] = [];
      
      // Check file type and parse accordingly
      if (file.name.toLowerCase().endsWith('.csv')) {
        // Handle CSV files
        const text = await file.text();
        jsonData = parseCSV(text);
      } else {
        // Handle Excel files (.xlsx, .xls)
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
      }
      
      // Process the data and import panels
      processImportData(jsonData);
      
      // Reset the file input
      e.target.value = '';
    } catch (error) {
      console.error("Error importing file:", error);
      toast({
        title: "Import Failed",
        description: "There was an error processing the file. Please check the file format.",
        variant: "destructive"
      });
      setImporting(false);
    }
  };

  const processImportData = async (data: any[]) => {
    if (!data || data.length === 0) {
      toast({
        title: "No Data Found",
        description: "No data was found in the file. Please check the file and try again.",
        variant: "destructive"
      });
      setImporting(false);
      return;
    }

    let added = 0;
    let updated = 0;
    let failed = 0;

    // Create items for database insertion
    const itemsForDb = [];
    const panelsToAdd = [];
    const panelsToUpdate = [];

    for (const row of data) {
      try {
        // Map common field variations to our schema
        const name = row.SerialNumber || row.Name || row.name || row.serial_number || '';
        
        if (!name) {
          failed++;
          continue;
        }

        // Check if panel already exists by name (serial number)
        const existingPanel = panels.find(p => p.serialNumber === name);
        
        // Prepare the data for panels table (items schema)
        const today = new Date().toISOString().split('T')[0];
        
        const itemData = {
          id: existingPanel?.id || uuidv4(),
          project_id: projectId || row.ProjectId || row.project_id || '',
          name: name,
          type: row.Type || row.type || 'Standard',
          status: row.Status || row.status || 'In Progress',
          date: formatDate(row.Date || row.date) || today,
          issue_transmittal_no: row.IssueTransmittalNo || row.issue_transmittal_no || row.Issue_Transmittal_No || '',
          dwg_no: row.DwgNo || row.dwg_no || row.Dwg_No || '',
          description: row.Description || row.description || '',
          tag: row.PanelTag || row.panel_tag || row.Panel_Tag || name,
          unit_qty: parseFloat(row.UnitQty || row.unit_qty || row.Unit_Qty || 0) || null,
          ifp_qty_nos: parseInt(row.IFPQtyNos || row.ifp_qty_nos || row.IFP_Qty_Nos || 0) || 0,
          ifp_qty: parseFloat(row.IFPQty || row.ifp_qty || row.IFP_Qty || 0) || null,
          draftman: row.Draftman || row.draftman || 'System Generated',
          checked_by: row.CheckedBy || row.checked_by || row.Checked_By || null,
          notes: row.Notes || row.notes || null
        };

        // Prepare Panel object for local state
        const panelData: Partial<Panel> = {
          serialNumber: name,
          name: name,
          type: itemData.type,
          status: itemData.status as PanelStatus,
          projectId: itemData.project_id,
          buildingId: buildingId,
          dimensions: {
            width: parseFloat(row.Width || row.width || 100),
            height: parseFloat(row.Height || row.height || 200),
            thickness: parseFloat(row.Thickness || row.thickness || 10)
          },
          weight: parseFloat(row.Weight || row.weight || 50),
          date: itemData.date,
          issueTransmittalNo: itemData.issue_transmittal_no,
          dwgNo: itemData.dwg_no,
          description: itemData.description,
          panelTag: itemData.tag,
          unitQty: itemData.unit_qty,
          ifpQtyNos: itemData.ifp_qty_nos,
          ifpQtyMeasurement: itemData.ifp_qty,
          draftman: itemData.draftman,
          checkedBy: itemData.checked_by,
          notes: itemData.notes,
          location: row.Location || row.location || null,
          manufacturedDate: formatDate(row.ManufacturedDate || row.manufactured_date) || today,
          deliveredDate: formatDate(row.DeliveredDate || row.delivered_date),
          installedDate: formatDate(row.InstalledDate || row.installed_date),
          inspectedDate: formatDate(row.InspectedDate || row.inspected_date)
        };

        if (existingPanel) {
          // Update existing panel
          itemsForDb.push({ ...itemData, id: existingPanel.id });
          panelsToUpdate.push({
            ...existingPanel,
            ...panelData,
            dimensions: {
              ...existingPanel.dimensions,
              ...panelData.dimensions
            }
          } as Panel);
          updated++;
        } else {
          // Add new panel
          itemsForDb.push(itemData);
          panelsToAdd.push({
            ...panelData,
            id: itemData.id,
            projectId: itemData.project_id || '',
            serialNumber: name,
            type: itemData.type,
            status: itemData.status as PanelStatus,
            dimensions: panelData.dimensions || { width: 100, height: 200, thickness: 10 },
            weight: panelData.weight || 50,
            manufacturedDate: panelData.manufacturedDate || today
          } as Panel);
          added++;
        }
      } catch (error) {
        console.error("Error processing row:", error, row);
        failed++;
      }
    }

    try {
      // Insert/update data in Supabase
      if (itemsForDb.length > 0) {
        const { error } = await supabase
          .from('panels')
          .upsert(itemsForDb, { onConflict: 'id' });
        
        if (error) {
          console.error("Database error:", error);
          throw error;
        }

        // Update local state
        panelsToAdd.forEach(panel => addPanel(panel));
        panelsToUpdate.forEach(panel => updatePanel(panel));
      }

      // Show import results
      setImportStats({
        added,
        updated,
        failed,
        total: data.length
      });
      
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
    } catch (error) {
      console.error("Error saving to database:", error);
      toast({
        title: "Database Error",
        description: "Failed to save data to database. Please try again.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
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
        <FileText className="h-4 w-4" /> Import Excel/CSV
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Panels from Excel/CSV</DialogTitle>
            <DialogDescription>
              Upload an Excel (.xlsx, .xls) or CSV file with panel data. Existing panels will be updated, and new panels will be added.
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
                      <Upload className="mr-2 h-4 w-4" /> Choose Excel/CSV file
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500">
                  Upload Excel (.xlsx, .xls) or CSV files with columns: SerialNumber, Name, Type, Status, etc.
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
