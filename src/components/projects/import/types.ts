
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

export interface ProjectImportData {
  id?: string; // Make id optional for updates
  name: string;
  location: string;
  client_name: string;
  status: ProjectStatus;
  start_date: string;
  created_by?: string; // Make created_by optional for updates
  end_date?: string;
  description?: string;
  estimated?: number | null;
  created_at?: string;
  updated_at: string;
}

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
