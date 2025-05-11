
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Project } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { ImportStats, ColumnMapping, ProjectImportHookReturn } from './types';
import { processProjectsData, handleFileSelected as fileSelectedHandler } from './importActions';
import { showImportResultToast } from './projectImportUtils';

export const useProjectImport = (onImportComplete?: () => void): ProjectImportHookReturn => {
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const { addProject, projects, updateProject } = useAppContext();
  const { user } = useAuth();
  
  const handleColumnMappingChange = (column: string, field: string) => {
    setColumnMappings(prev => ({
      ...prev,
      [column]: field
    }));
  };
  
  const handleFileSelected = (file: File) => {
    fileSelectedHandler(
      file,
      setUploadedFile,
      setPreview,
      setImportStats,
      setColumnMappings
    );
  };

  const importProjects = async () => {
    if (!uploadedFile) return;
    
    try {
      setImporting(true);
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Process and import projects
      const result = await processProjectsData(
        jsonData, 
        columnMappings, 
        projects, 
        user?.id || '', 
        addProject, 
        updateProject
      );
      
      setImportStats(result);
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error("Error importing projects:", error);
      showImportResultToast({
        added: 0,
        updated: 0,
        failed: 1,
        skipped: 0,
        total: 1
      });
    } finally {
      setImporting(false);
    }
  };

  const resetForm = () => {
    setPreview([]);
    setColumnMappings({});
    setUploadedFile(null);
    setImportStats(null);
  };

  return {
    importing,
    preview,
    columnMappings,
    uploadedFile,
    importStats,
    handleFileSelected,
    handleColumnMappingChange,
    importProjects,
    resetForm
  };
};
