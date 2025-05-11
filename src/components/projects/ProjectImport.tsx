
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Project, ProjectStatus } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatTimestamp } from '@/lib/utils';

interface ProjectImportProps {
  onImportComplete?: () => void;
}

interface ImportStats {
  added: number;
  updated: number;
  failed: number;
  skipped: number;
  total: number;
}

const ProjectImport: React.FC<ProjectImportProps> = ({ onImportComplete }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const { addProject, projects } = useAppContext();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploadedFile(file);
    
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
          
          // Auto-map columns based on names - prioritize specific columns we're looking for
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
        toast({
          title: "Error",
          description: "Could not parse the file. Is it a valid Excel/CSV file?",
          variant: "destructive"
        });
      }
    };
    reader.readAsBinaryString(file);
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
      const result = await processProjectsData(jsonData);
      setImportStats(result);
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error("Error importing projects:", error);
      toast({
        title: "Import Failed",
        description: "There was an error processing the file data. Please check the file format.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const processProjectsData = async (data: any[]): Promise<ImportStats> => {
    if (!data || data.length === 0) {
      toast({
        title: "No Data Found",
        description: "No data was found in the file. Please check the file and try again.",
        variant: "destructive"
      });
      return { added: 0, updated: 0, failed: 0, skipped: 0, total: 0 };
    }

    let added = 0;
    let updated = 0;
    let failed = 0;
    let skipped = 0;

    const batchPromises = data.map(async (row) => {
      try {
        // Extract data using the column mappings
        const extractValue = (field: string) => {
          const sourceColumn = Object.keys(columnMappings).find(key => columnMappings[key] === field);
          return sourceColumn ? row[sourceColumn] : undefined;
        };
        
        // Important: Get projectId - mandatory field
        const projectId = extractValue('id');
        
        // Skip rows without essential ID data
        if (!projectId) {
          skipped++;
          console.log("Skipping row without ID:", row);
          return;
        }

        // Get project name - use fallback if missing
        const projectName = extractValue('name') || 'Untitled Project';
        
        // Format dates correctly using our utility functions - allow null values
        const createdAt = formatTimestamp(extractValue('createdAt'));
        const updatedAt = formatTimestamp(extractValue('updatedAt'));
        
        // Handle estimated value - allow null
        const estimatedValue = extractValue('estimated');
        const estimated = estimatedValue !== undefined ? (Number(estimatedValue) || null) : null;
        
        // Get location or use empty string as fallback
        const location = extractValue('location') || '';
        
        // Get client name or use empty string as fallback
        const clientName = extractValue('clientName') || '';
        
        // Get/format dates - use fallbacks if missing
        const startDate = formatDate(extractValue('startDate')) || new Date().toISOString().split('T')[0];
        const endDate = formatDate(extractValue('endDate'));
        
        // Get description - allow null
        const description = extractValue('description');
        
        // Normalize status - Set default if not provided
        let rawStatus = (extractValue('status') as string || '').toLowerCase();
        let status: ProjectStatus = 'active'; // Default status
        
        if (rawStatus === 'active' || rawStatus === 'completed' || rawStatus === 'on-hold') {
          status = rawStatus as ProjectStatus;
        }

        // Check if project already exists
        const projectIdStr = projectId ? String(projectId) : '';
        const existingProject = projects.find(p => String(p.id) === projectIdStr);
        
        if (user) {
          const projectData = {
            name: projectName,
            location: location,
            client_name: clientName,
            status: status,
            start_date: startDate,
            end_date: endDate,
            description: description,
            estimated: estimated,
          };

          // Add non-null values to the data object
          const finalProjectData: Record<string, any> = {};
          Object.entries(projectData).forEach(([key, value]) => {
            // Only include non-undefined values (allow null)
            if (value !== undefined) {
              finalProjectData[key] = value;
            }
          });
          
          // Add timestamps if provided
          if (createdAt) finalProjectData.created_at = createdAt;
          if (updatedAt) finalProjectData.updated_at = updatedAt;

          if (existingProject) {
            // Update existing project
            await supabase.from('projects').update({
              ...finalProjectData,
              // Always update the updated_at if not explicitly provided
              updated_at: updatedAt || new Date().toISOString(),
            }).eq('id', existingProject.id);
            
            updated++;
            console.log(`Updated project: ${projectIdStr}`);
          } else {
            // Create new project - preserve numeric ID if it exists, otherwise generate UUID
            const newId = projectId ? String(projectId) : uuidv4();
            
            await supabase.from('projects').insert({
              ...finalProjectData,
              id: newId,
              created_by: user.id, // Use current user ID as creator
              // Set timestamps if not provided
              created_at: createdAt || new Date().toISOString(),
              updated_at: updatedAt || new Date().toISOString(),
            });
            
            // Add to local state as well
            addProject({
              id: newId,
              name: projectName,
              location: location,
              clientName: clientName,
              status: status,
              startDate: startDate,
              endDate: endDate,
              description: description,
              panelCount: 0,
            });
            
            added++;
            console.log(`Added new project: ${newId}`);
          }
        } else {
          failed++;
          console.error("User is not logged in, cannot import projects");
        }
      } catch (error) {
        console.error("Error processing project:", error, row);
        failed++;
      }
    });
    
    await Promise.all(batchPromises);
    
    // Show import results
    if (failed > 0) {
      toast({
        title: "Import Completed with Errors",
        description: `Added ${added} projects, updated ${updated} projects. ${failed} projects failed to import.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Import Successful",
        description: `Added ${added} projects, updated ${updated} projects. Skipped ${skipped} rows without ID.`,
      });
    }
    
    return {
      added,
      updated,
      failed,
      skipped,
      total: data.length
    };
  };

  const resetForm = () => {
    setPreview([]);
    setColumnMappings({});
    setUploadedFile(null);
    setImportStats(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <>
      <Button
        variant="outline"
        className="bg-white flex gap-2"
        onClick={() => setIsDialogOpen(true)}
      >
        <FileSpreadsheet className="h-4 w-4" /> Import Projects
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Import Projects</DialogTitle>
            <DialogDescription>
              Import CSV or Excel files with project data. Required columns: ID and Name. Optional columns: Estimated, Created_at, Updated_at.
            </DialogDescription>
          </DialogHeader>
          
          {importStats ? (
            <div className="py-6">
              <h3 className="text-lg font-medium">Import Results</h3>
              <div className="mt-4 space-y-3">
                <p><strong>Total rows processed:</strong> {importStats.total}</p>
                <p><strong>Projects added:</strong> {importStats.added}</p>
                <p><strong>Projects updated:</strong> {importStats.updated}</p>
                <p><strong>Rows skipped:</strong> {importStats.skipped}</p>
                {importStats.failed > 0 && (
                  <p className="text-red-500"><strong>Failed imports:</strong> {importStats.failed}</p>
                )}
              </div>
            </div>
          ) : preview.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <h3 className="text-lg font-medium mb-2">Data Preview</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(preview[0]).map((header, index) => (
                        <TableHead key={index}>
                          {header}
                          <div className="mt-1">
                            <select 
                              className="text-xs border rounded px-1 py-0.5 w-full"
                              value={columnMappings[header] || ''}
                              onChange={(e) => {
                                setColumnMappings(prev => ({
                                  ...prev,
                                  [header]: e.target.value
                                }));
                              }}
                            >
                              <option value="">Ignore</option>
                              <option value="id">ID</option>
                              <option value="name">Project Name</option>
                              <option value="estimated">Estimated</option>
                              <option value="createdAt">Created At</option>
                              <option value="updatedAt">Updated At</option>
                              <option value="location">Location</option>
                              <option value="clientName">Client Name</option>
                              <option value="status">Status</option>
                              <option value="startDate">Start Date</option>
                              <option value="endDate">End Date</option>
                              <option value="description">Description</option>
                            </select>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Object.keys(preview[0]).map((header, colIndex) => (
                          <TableCell key={`${rowIndex}-${colIndex}`}>{String(row[header])}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-sm text-gray-500 mt-2">Showing first 5 rows.</p>
              </div>
              
              <Button 
                onClick={importProjects} 
                className="w-full" 
                disabled={importing}
              >
                {importing ? "Importing..." : "Import Projects"}
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />
                <Button 
                  onClick={openFileSelector} 
                  className="w-full" 
                >
                  <Upload className="mr-2 h-4 w-4" /> Choose Excel/CSV file
                </Button>
                <p className="text-sm text-gray-500 text-center">
                  Upload project data with columns: ID (required), Name, Estimated, Created_at, Updated_at
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

export default ProjectImport;
