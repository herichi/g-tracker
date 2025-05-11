
import React, { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Import our new components
import FileUpload from './import/FileUpload';
import DataPreview from './import/DataPreview';
import ImportResults from './import/ImportResults';
import { useProjectImport } from './import/useProjectImport';

interface ProjectImportProps {
  onImportComplete?: () => void;
}

const ProjectImport: React.FC<ProjectImportProps> = ({ onImportComplete }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const {
    importing,
    preview,
    columnMappings,
    importStats,
    handleFileSelected,
    handleColumnMappingChange,
    importProjects,
    resetForm
  } = useProjectImport(onImportComplete);

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
              Import CSV or Excel files with project data. Required columns: ID and Name. 
              Optional columns: Estimated, Created_at, Updated_at, Location, Client Name, 
              Status, Start Date, End Date, Description.
            </DialogDescription>
          </DialogHeader>
          
          {importStats ? (
            <ImportResults stats={importStats} />
          ) : preview.length > 0 ? (
            <DataPreview 
              previewData={preview}
              columnMappings={columnMappings}
              onColumnMappingChange={handleColumnMappingChange}
              onImport={importProjects}
              importing={importing}
            />
          ) : (
            <div className="grid gap-4 py-4">
              <FileUpload onFileSelect={handleFileSelected} />
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
