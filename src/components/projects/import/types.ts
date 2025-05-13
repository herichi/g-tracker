
import { ProjectStatus } from '@/types';

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

// Remove the ProjectImportData interface as we're using direct object literals
// that match the Supabase table structure instead of this interface

export type ProjectImportHookReturn = {
  importing: boolean;
  preview: any[];
  columnMappings: ColumnMapping;
  uploadedFile: File | null;
  importStats: ImportStats | null;
  handleFileSelected: (file: File) => void;
  handleColumnMappingChange: (column: string, field: string) => void;
  importProjects: () => Promise<void>;
  resetForm: () => void;
};
