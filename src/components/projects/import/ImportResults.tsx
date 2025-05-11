
import React from 'react';
import { ImportStats } from './projectImportUtils';

interface ImportResultsProps {
  stats: ImportStats;
}

const ImportResults: React.FC<ImportResultsProps> = ({ stats }) => {
  return (
    <div className="py-6">
      <h3 className="text-lg font-medium">Import Results</h3>
      <div className="mt-4 space-y-3">
        <p><strong>Total rows processed:</strong> {stats.total}</p>
        <p><strong>Projects added:</strong> {stats.added}</p>
        <p><strong>Projects updated:</strong> {stats.updated}</p>
        <p><strong>Rows skipped:</strong> {stats.skipped}</p>
        {stats.failed > 0 && (
          <p className="text-red-500"><strong>Failed imports:</strong> {stats.failed}</p>
        )}
      </div>
    </div>
  );
};

export default ImportResults;
