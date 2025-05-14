
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectStatus } from '@/types';
import { 
  ColumnMapping, 
  ImportStats
} from './types';
import { 
  extractValueFromRow, 
  normalizeStatus,
  showImportResultToast 
} from './projectImportUtils';
import { formatDate, formatTimestamp } from '@/lib/utils';

export async function processProjectsData(
  data: any[], 
  columnMappings: ColumnMapping, 
  projects: Project[], 
  userId: string,
  addProject: (project: Project) => void,
  updateProject: (project: Project) => void
): Promise<ImportStats> {
  if (!data || data.length === 0) {
    showImportResultToast({
      added: 0,
      updated: 0,
      failed: 0,
      skipped: 0,
      total: 0
    });
    return { added: 0, updated: 0, failed: 0, skipped: 0, total: 0 };
  }

  let added = 0;
  let updated = 0;
  let failed = 0;
  let skipped = 0;

  const batchPromises = data.map(async (row) => {
    try {
      // Extract project ID - mandatory field
      const projectId = extractValueFromRow(row, 'id', columnMappings);
      
      // Skip rows without essential ID data
      if (!projectId) {
        console.log("Skipping row without ID:", row);
        skipped++;
        return;
      }

      // Get project name - use fallback if missing
      const projectName = extractValueFromRow(row, 'name', columnMappings) || 'Untitled Project';
      
      // Format dates correctly using our utility functions - allow null values
      const createdAt = formatTimestamp(extractValueFromRow(row, 'createdAt', columnMappings));
      const updatedAt = formatTimestamp(extractValueFromRow(row, 'updatedAt', columnMappings));
      
      // Handle estimated value - allow null
      const estimatedValue = extractValueFromRow(row, 'estimated', columnMappings);
      const estimated = estimatedValue !== undefined ? (Number(estimatedValue) || null) : null;
      
      // Get location or use empty string as fallback
      const location = extractValueFromRow(row, 'location', columnMappings) || '';
      
      // Get client name or use empty string as fallback
      const clientName = extractValueFromRow(row, 'clientName', columnMappings) || '';
      
      // Get/format dates - use fallbacks if missing
      const startDate = formatDate(extractValueFromRow(row, 'startDate', columnMappings)) || new Date().toISOString().split('T')[0];
      const endDate = formatDate(extractValueFromRow(row, 'endDate', columnMappings));
      
      // Get description - allow null
      const description = extractValueFromRow(row, 'description', columnMappings);
      
      // Normalize status - Set default if not provided
      const rawStatus = extractValueFromRow(row, 'status', columnMappings) as string;
      const status = normalizeStatus(rawStatus);

      // Check if project already exists - convert IDs to strings and trim for reliable comparison
      const projectIdStr = String(projectId).trim();
      const existingProject = projects.find(p => String(p.id).trim() === projectIdStr);
      
      if (!userId) {
        console.error("User is not logged in, cannot import projects");
        failed++;
        return;
      }

      if (existingProject) {
        // Check if there are any actual changes to the project data
        const hasChanges = 
          projectName !== existingProject.name ||
          location !== existingProject.location ||
          clientName !== existingProject.clientName ||
          status !== existingProject.status ||
          startDate !== existingProject.startDate ||
          (endDate !== existingProject.endDate && (endDate || existingProject.endDate)) || // Handle case where one is undefined
          (description !== existingProject.description && (description !== undefined || existingProject.description !== undefined)) ||
          (estimated !== existingProject.estimated && (estimated !== null || existingProject.estimated !== null));
        
        // Skip if no changes
        if (!hasChanges) {
          console.log("No changes detected for project:", projectIdStr);
          skipped++;
          return;
        }
        
        // For updates, prepare the update data (omit id and created_by since they shouldn't be changed)
        const projectData = {
          name: projectName,
          location: location || existingProject.location, 
          client_name: clientName || existingProject.clientName,
          status: status,
          start_date: startDate,
          updated_at: new Date().toISOString() // Always use current timestamp for updates
        };
        
        // Add optional fields only if they have values, either from import or existing project
        if (endDate || existingProject.endDate) {
          projectData.end_date = endDate || existingProject.endDate;
        }
        
        if (description !== undefined) {
          projectData.description = description;
        }
        
        if (estimated !== undefined && estimated !== null) {
          projectData.estimated = estimated;
        }
        
        console.log("Updating project:", projectIdStr, projectData);
        
        // Perform the update using Supabase
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', projectIdStr);
        
        if (error) {
          console.error("Error updating project:", error);
          failed++;
          return;
        }
        
        // Update local state as well to reflect changes
        const updatedProjectData = {
          ...existingProject,
          name: projectName,
          location: location || existingProject.location, 
          clientName: clientName || existingProject.clientName,
          status: status,
          startDate: startDate,
          endDate: endDate || existingProject.endDate,
          description: description !== undefined ? description : existingProject.description,
          estimated: estimated !== null ? estimated : existingProject.estimated
        };
        
        updateProject(updatedProjectData);
        console.log("Project updated successfully:", updatedProjectData);
        updated++;
      } else {
        // Create new project - preserve ID if it exists, otherwise generate UUID
        const newId = projectIdStr || uuidv4();
        
        // For new projects, prepare the insert data
        const projectData = {
          id: newId,
          name: projectName,
          location: location,
          client_name: clientName,
          status: status,
          start_date: startDate,
          created_by: userId, // Required for insert
          created_at: createdAt || new Date().toISOString(),
          updated_at: updatedAt || new Date().toISOString()
        };
        
        // Add optional fields only if they have values
        if (endDate) {
          projectData.end_date = endDate;
        }
        
        if (description !== undefined) {
          projectData.description = description;
        }
        
        if (estimated !== undefined && estimated !== null) {
          projectData.estimated = estimated;
        }
        
        console.log("Creating new project:", newId, projectData);
        
        // Perform the insert
        const { error } = await supabase
          .from('projects')
          .insert(projectData);
        
        if (error) {
          console.error("Error creating project:", error, projectData);
          failed++;
          return;
        }
        
        // Add to local state as well
        const newProject: Project = {
          id: newId,
          name: projectName,
          location: location || '',
          clientName: clientName || '',
          status: status,
          startDate: startDate,
          endDate: endDate,
          description: description,
          estimated: estimated,
          panelCount: 0,
        };
        
        addProject(newProject);
        console.log("Project added successfully:", newProject);
        added++;
      }
    } catch (error) {
      console.error("Error processing project:", error, row);
      failed++;
    }
  });
  
  // Wait for all operations to complete
  await Promise.all(batchPromises);
  
  // Show import results
  const importStats = {
    added,
    updated,
    failed,
    skipped,
    total: data.length
  };
  
  showImportResultToast(importStats);
  
  return importStats;
}

export const handleFileSelected = (
  file: File, 
  setUploadedFile: (file: File | null) => void,
  setPreview: (data: any[]) => void,
  setImportStats: (stats: ImportStats | null) => void,
  setColumnMappings: (mappings: ColumnMapping) => void
) => {
  setUploadedFile(file);
  setPreview([]);
  setImportStats(null);
  
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length > 0) {
        setPreview(jsonData.slice(0, 5)); // Show first 5 rows as preview
        
        // Auto-map columns based on names
        const firstRow = jsonData[0];
        const keys = Object.keys(firstRow);
        const autoMappings: Record<string, string> = {};
        
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
        
        setColumnMappings(autoMappings);
      }
    } catch (error) {
      console.error("Error reading Excel/CSV file:", error);
      showImportResultToast({
        added: 0,
        updated: 0,
        failed: 1,
        skipped: 0,
        total: 1
      });
    }
  };
  reader.readAsBinaryString(file);
};
