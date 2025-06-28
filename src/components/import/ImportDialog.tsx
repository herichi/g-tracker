
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  importing: boolean;
  onFileSelect: () => void;
  importStats: {
    added: number;
    updated: number;
    failed: number;
    total: number;
  } | null;
  onClose: () => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onOpenChange,
  importing,
  onFileSelect,
  importStats,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Panels from Excel/CSV</DialogTitle>
          <DialogDescription>
            Upload an Excel (.xlsx, .xls) or CSV file with panel data. Existing panels will be updated, and new panels will be added.
          </DialogDescription>
        </DialogHeader>
        
        {importStats ? (
          <div className="py-6">
            <h3 className="text-lg font-medium">Import Results</h3>
            <div className="mt-4 space-y-3">
              <p><strong>Total rows processed:</strong> {importStats.total}</p>
              <p><strong>Panels added:</strong> {importStats.added}</p>
              <p><strong>Panels updated:</strong> {importStats.updated}</p>
              {importStats.failed > 0 && (
                <p className="text-red-500"><strong>Failed imports:</strong> {importStats.failed}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <Button 
                onClick={onFileSelect} 
                className="w-full" 
                disabled={importing}
              >
                {importing ? (
                  <span>Importing...</span>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Choose Excel/CSV file
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500">
                Upload Excel (.xlsx, .xls) or CSV files with columns: SerialNumber, Name, Type, Status, etc.
              </p>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {importStats ? "Close" : "Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
