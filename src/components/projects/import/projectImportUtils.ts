
import * as XLSX from 'xlsx';
import { toast } from "@/components/ui/use-toast";
import { ProjectStatus } from '@/types';
import { formatDate, formatTimestamp } from '@/lib/utils';
import { ImportStats, ColumnMapping } from './types';

export interface PreviewData {
  data: any[];
  mappings: ColumnMapping;
}

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
      description: `Added ${stats.added} projects, updated ${stats.updated} projects. Skipped ${stats.skipped} rows.`,
    });
  }
};
