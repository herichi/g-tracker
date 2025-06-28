
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileSpreadsheet, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { ItemFormData, ItemStatus } from '@/types/item';

interface ItemExcelImportProps {
  onImport: (items: ItemFormData[]) => Promise<void>;
  onClose: () => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

const validStatuses: ItemStatus[] = ['Proceed for Delivery', 'In Progress', 'Completed', 'On Hold'];

export const ItemExcelImport: React.FC<ItemExcelImportProps> = ({ onImport, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const parseExcelFile = (file: File): Promise<ItemFormData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const items: ItemFormData[] = jsonData.map((row: any) => {
            // Validate and normalize status
            let status: ItemStatus = 'In Progress';
            const rowStatus = String(row.status || row.Status || 'In Progress');
            if (validStatuses.includes(rowStatus as ItemStatus)) {
              status = rowStatus as ItemStatus;
            }

            return {
              project_id: String(row.project_id || row.Project_ID || ''),
              name: String(row.name || row.Name || ''),
              type: String(row.type || row.Type || ''),
              status: status,
              date: row.date || row.Date || new Date().toISOString().split('T')[0],
              issue_transmittal_no: String(row.issue_transmittal_no || row.Issue_Transmittal_No || ''),
              dwg_no: String(row.dwg_no || row.Dwg_No || ''),
              description: String(row.description || row.Description || ''),
              panel_tag: String(row.panel_tag || row.Panel_Tag || ''),
              unit_qty: parseFloat(row.unit_qty || row.Unit_Qty || 0),
              ifp_qty_nos: parseInt(row.ifp_qty_nos || row.IFP_Qty_Nos || 0),
              ifp_qty: parseFloat(row.ifp_qty || row.IFP_Qty || 0),
              draftman: String(row.draftman || row.Draftman || ''),
            };
          });

          resolve(items);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setProgress(0);

    try {
      const items = await parseExcelFile(file);
      setProgress(50);

      await onImport(items);
      setProgress(100);

      setImportResult({
        success: items.length,
        failed: 0,
        errors: []
      });
    } catch (error) {
      setImportResult({
        success: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setImportResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Import Items from Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!importResult && (
          <>
            <div>
              <Label htmlFor="excel-file">Select Excel File</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="mt-1"
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Make sure your Excel file contains columns: project_id, name, type, status, date, 
                issue_transmittal_no, dwg_no, description, panel_tag, unit_qty, ifp_qty_nos, ifp_qty, draftman.
                Valid status values: {validStatuses.join(', ')}
              </AlertDescription>
            </Alert>

            {isImporting && (
              <div className="space-y-2">
                <Label>Import Progress</Label>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600">Processing... {progress}%</p>
              </div>
            )}
          </>
        )}

        {importResult && (
          <div className="space-y-4">
            <Alert className={importResult.success > 0 ? "border-green-500" : "border-red-500"}>
              {importResult.success > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>
                <div className="space-y-1">
                  <p><strong>Import completed!</strong></p>
                  <p>✅ Successfully imported: {importResult.success} items</p>
                  {importResult.failed > 0 && (
                    <p>❌ Failed to import: {importResult.failed} items</p>
                  )}
                  {importResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Errors:</p>
                      <ul className="list-disc list-inside text-sm">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          {!importResult && (
            <>
              <Button 
                onClick={handleImport} 
                disabled={!file || isImporting}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isImporting ? 'Importing...' : 'Import Items'}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </>
          )}
          
          {importResult && (
            <>
              <Button onClick={resetForm} variant="outline">
                Import Another File
              </Button>
              <Button onClick={onClose}>
                Close
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
