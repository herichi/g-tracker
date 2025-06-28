
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import ImportDialog from '@/components/import/ImportDialog';
import { usePanelImport } from '@/hooks/usePanelImport';

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
  const { importing, importStats, handleFileUpload, resetImportStats } = usePanelImport(
    projectId,
    buildingId,
    onImportComplete
  );

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetImportStats();
  };

  const openFileSelector = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls,.csv';
    fileInput.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
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

      <ImportDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        importing={importing}
        onFileSelect={openFileSelector}
        importStats={importStats}
        onClose={closeDialog}
      />
    </>
  );
};

export default PanelExcelImport;
