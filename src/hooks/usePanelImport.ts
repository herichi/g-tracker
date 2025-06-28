
import { useState } from 'react';
import { Panel, PanelStatus } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { parseFile } from '@/utils/fileParser';
import { mapRowToPanelData } from '@/utils/panelDataMapper';

interface ImportStats {
  added: number;
  updated: number;
  failed: number;
  total: number;
}

export const usePanelImport = (
  projectId?: string,
  buildingId?: string,
  onImportComplete?: () => void
) => {
  const [importing, setImporting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const { panels, addPanel, updatePanel } = useAppContext();

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

    const itemsForDb = [];
    const panelsToAdd = [];
    const panelsToUpdate = [];

    for (const row of data) {
      try {
        const name = row.SerialNumber || row.Name || row.name || row.serial_number || '';
        
        if (!name) {
          failed++;
          continue;
        }

        const existingPanel = panels.find(p => p.serialNumber === name);
        const { itemData, panelData } = mapRowToPanelData(row, projectId, buildingId, existingPanel);

        if (existingPanel) {
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
            manufacturedDate: panelData.manufacturedDate || new Date().toISOString().split('T')[0]
          } as Panel);
          added++;
        }
      } catch (error) {
        console.error("Error processing row:", error, row);
        failed++;
      }
    }

    try {
      if (itemsForDb.length > 0) {
        const { error } = await supabase
          .from('panels')
          .upsert(itemsForDb, { onConflict: 'id' });
        
        if (error) {
          console.error("Database error:", error);
          throw error;
        }

        panelsToAdd.forEach(panel => addPanel(panel));
        panelsToUpdate.forEach(panel => updatePanel(panel));
      }

      setImportStats({ added, updated, failed, total: data.length });
      
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

  const handleFileUpload = async (file: File) => {
    try {
      setImporting(true);
      const jsonData = await parseFile(file);
      await processImportData(jsonData);
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

  const resetImportStats = () => {
    setImportStats(null);
  };

  return {
    importing,
    importStats,
    handleFileUpload,
    resetImportStats
  };
};
