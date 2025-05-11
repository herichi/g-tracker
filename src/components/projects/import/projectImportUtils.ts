
import * as XLSX from 'xlsx';
import { toast } from "@/components/ui/use-toast";
import { Project, ProjectStatus } from '@/types';
import { formatDate, formatTimestamp } from '@/lib/utils';

export interface ImportStats {
  added: number;
  updated: number;
  failed: number;
  skipped: number;
  total: number;
}

export interface ColumnMapping {
  [excelColumn: string]: string;
}

export interface PreviewData {
  data: any[];
  mappings: ColumnMapping;
}

/**
 * Reads and processes the Excel/CSV file
 */
export const processFile = (file: File): Promise<PreviewData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length > 0) {
          const previewData = jsonData.slice(0, 5); // Show first 5 rows as preview
          const mappings = generateColumnMappings(jsonData[0]);
          resolve({ data: previewData, mappings });
        } else {
          reject(new Error("No data found in the file"));
        }
      } catch (error) {
        console.error("Error reading Excel/CSV file:", error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

/**
 * Auto-maps columns based on their names
 */
export const generateColumnMappings = (firstRow: any): ColumnMapping => {
  const keys = Object.keys(firstRow);
  const autoMappings: ColumnMapping = {};
  
  keys.forEach(key => {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'id') autoMappings[key] = 'id';
    else if (lowerKey === 'name') autoMappings[key] = 'name';
    else if (lowerKey === 'estimated') autoMappings[key] = 'estimated';
    else if (lowerKey.includes('created_at') || lowerKey === 'createdat') autoMappings[key] = 'createdAt';
    else if (lowerKey.includes('updated_at') || lowerKey === 'updatedat') autoMappings[key] = 'updatedAt';
    else if (lowerKey.includes('location')) autoMappings[key] = 'location';
    else if (lowerKey.includes('status')) autoMappings[key] = 'status';
    else if (lowerKey.includes('client')) autoMappings[key] = 'clientName';
    else if (lowerKey.includes('start')) autoMappings[key] = 'startDate';
    else if (lowerKey.includes('end')) autoMappings[key] = 'endDate';
    else if (lowerKey.includes('description') || lowerKey.includes('desc')) autoMappings[key] = 'description';
  });
  
  return autoMappings;
};

/**
 * Extract value from a row based on column mapping
 */
export const extractValueFromRow = (row: any, field: string, columnMappings: ColumnMapping): any => {
  const sourceColumn = Object.keys(columnMappings).find(key => columnMappings[key] === field);
  return sourceColumn ? row[sourceColumn] : undefined;
};

/**
 * Normalize project status from string value
 */
export const normalizeStatus = (status: string | undefined): ProjectStatus => {
  if (!status) return 'active';
  
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus === 'active' || normalizedStatus === 'completed' || normalizedStatus === 'on-hold') {
    return normalizedStatus as ProjectStatus;
  }
  return 'active';
};

/**
 * Shows import result toast notification
 */
export const showImportResultToast = (stats: ImportStats): void => {
  if (stats.failed > 0) {
    toast({
      title: "Import Completed with Errors",
      description: `Added ${stats.added} projects, updated ${stats.updated} projects. ${stats.failed} projects failed to import.`,
      variant: "destructive"
    });
  } else {
    toast({
      title: "Import Successful",
      description: `Added ${stats.added} projects, updated ${stats.updated} projects. Skipped ${stats.skipped} rows without ID.`,
    });
  }
};
