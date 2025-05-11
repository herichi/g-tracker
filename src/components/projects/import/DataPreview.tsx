
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ColumnMapping } from './projectImportUtils';

interface DataPreviewProps {
  previewData: any[];
  columnMappings: ColumnMapping;
  onColumnMappingChange: (column: string, field: string) => void;
  onImport: () => void;
  importing: boolean;
}

const DataPreview: React.FC<DataPreviewProps> = ({
  previewData,
  columnMappings,
  onColumnMappingChange,
  onImport,
  importing
}) => {
  if (!previewData.length) return null;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <h3 className="text-lg font-medium mb-2">Data Preview</h3>
        <Table>
          <TableHeader>
            <TableRow>
              {Object.keys(previewData[0]).map((header, index) => (
                <TableHead key={index}>
                  {header}
                  <div className="mt-1">
                    <select 
                      className="text-xs border rounded px-1 py-0.5 w-full"
                      value={columnMappings[header] || ''}
                      onChange={(e) => onColumnMappingChange(header, e.target.value)}
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
            {previewData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {Object.keys(previewData[0]).map((header, colIndex) => (
                  <TableCell key={`${rowIndex}-${colIndex}`}>{String(row[header])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-sm text-gray-500 mt-2">Showing first 5 rows.</p>
      </div>
      
      <Button 
        onClick={onImport} 
        className="w-full" 
        disabled={importing}
      >
        {importing ? "Importing..." : "Import Projects"}
      </Button>
    </div>
  );
};

export default DataPreview;
