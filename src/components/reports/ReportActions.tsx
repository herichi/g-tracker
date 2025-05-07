
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TableIcon, QrCode, Download, Printer } from "lucide-react";

interface ReportActionsProps {
  loading: boolean;
  onExportToExcel: () => void;
  onPrintView: () => void;
  onRefreshQRCodes: () => void;
}

const ReportActions: React.FC<ReportActionsProps> = ({
  loading,
  onExportToExcel,
  onPrintView,
  onRefreshQRCodes
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <TabsList>
          <TabsTrigger value="table" className="flex items-center">
            <TableIcon className="mr-2 h-4 w-4" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center">
            <QrCode className="mr-2 h-4 w-4" />
            QR Card View
          </TabsTrigger>
        </TabsList>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={onExportToExcel}
          className="flex items-center"
        >
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
        <Button 
          onClick={onPrintView} 
          variant="outline"
          className="flex items-center"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print View
        </Button>
        <Button 
          onClick={onRefreshQRCodes} 
          variant="outline"
          disabled={loading}
          className="flex items-center"
        >
          <QrCode className="mr-2 h-4 w-4" />
          {loading ? "Refreshing..." : "Refresh QR Codes"}
        </Button>
      </div>
    </div>
  );
};

export default ReportActions;
